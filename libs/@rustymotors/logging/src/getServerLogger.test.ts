import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import * as winston from 'winston';
import Transport from 'winston-transport';
import {
	_createServerLoggerForTesting,
	bindLogContext,
	getLogContext,
	runWithLogContext,
	setLogContext,
} from './getServerLogger.js';

interface CapturedInfo extends Record<string, unknown> {
	level: string;
}

class MemoryTransport extends Transport {
	public records: CapturedInfo[] = [];

	override log(info: CapturedInfo, callback: () => void): void {
		this.records.push(info);
		setImmediate(callback);
	}
}

function makeMemoryLogger() {
	const transport = new MemoryTransport();
	const logger = winston.createLogger({
		level: 'debug',
		transports: [transport],
	});
	return { logger, transport };
}

/**
 * For most tests we don't need the Winston pipeline — we just want to see
 * exactly what the wrapper emitted. A fake "logger" that captures the
 * (level, info) tuple straight from `logger.log(...)` keeps assertions
 * focused on the wrapper's own behavior.
 */
function makeFakeWinston() {
	const calls: Array<{ level: string; info: Record<string, unknown> }> = [];
	const fake = {
		log: vi.fn((level: string, info: Record<string, unknown>) => {
			calls.push({ level, info });
		}),
	} as unknown as winston.Logger;
	return { fake, calls };
}

describe('AsyncLocalStorage primitives', () => {
	it('getLogContext returns undefined outside a run frame', () => {
		expect(getLogContext()).toBeUndefined();
	});

	it('runWithLogContext makes the context readable from inside', () => {
		const ctx = { connectionId: 'abc', port: 8226 };
		runWithLogContext(ctx, () => {
			expect(getLogContext()).toEqual(ctx);
		});
		expect(getLogContext()).toBeUndefined();
	});

	it('setLogContext mutates the current store and is visible to later reads', () => {
		runWithLogContext({ connectionId: 'abc' }, () => {
			setLogContext({ personaId: 42 });
			expect(getLogContext()).toEqual({ connectionId: 'abc', personaId: 42 });
		});
	});

	it('setLogContext outside a frame is a no-op (no throw)', () => {
		expect(() => setLogContext({ personaId: 99 })).not.toThrow();
		expect(getLogContext()).toBeUndefined();
	});

	it('nested runWithLogContext: inner shadows outer for inner scope only', () => {
		runWithLogContext({ connectionId: 'outer' }, () => {
			runWithLogContext({ connectionId: 'inner', port: 1 }, () => {
				expect(getLogContext()).toEqual({ connectionId: 'inner', port: 1 });
			});
			expect(getLogContext()).toEqual({ connectionId: 'outer' });
		});
	});
});

describe('AsyncLocalStorage propagation', () => {
	it('propagates through awaited promises', async () => {
		await runWithLogContext({ connectionId: 'p1' }, async () => {
			await Promise.resolve();
			expect(getLogContext()).toEqual({ connectionId: 'p1' });
			await new Promise((r) => setImmediate(r));
			expect(getLogContext()).toEqual({ connectionId: 'p1' });
		});
	});

	it('propagates through setTimeout callbacks', async () => {
		await new Promise<void>((resolve) => {
			runWithLogContext({ connectionId: 'timer' }, () => {
				setTimeout(() => {
					expect(getLogContext()).toEqual({ connectionId: 'timer' });
					resolve();
				}, 0);
			});
		});
	});

	it('propagates through long-lived async loops (queue-style)', async () => {
		// Mirrors MessageQueue's _run pattern: a constructor kicks off an
		// async while-loop, and we want callbacks invoked by that loop to
		// inherit the context where the constructor ran.
		const seen: Array<{ connectionId?: string }> = [];
		const work: Array<() => void> = [];

		class FakeQueue {
			constructor(private cb: () => void) {
				void this.run();
			}
			private async run() {
				while (work.length === 0) {
					await new Promise((r) => setTimeout(r, 1));
				}
				const job = work.shift();
				job?.();
				this.cb();
			}
		}

		await new Promise<void>((resolve) => {
			runWithLogContext({ connectionId: 'queue1' }, () => {
				new FakeQueue(() => {
					seen.push({ ...(getLogContext() ?? {}) });
					resolve();
				});
				work.push(() => {
					seen.push({ ...(getLogContext() ?? {}) });
				});
			});
		});

		expect(seen).toHaveLength(2);
		expect(seen[0]).toEqual({ connectionId: 'queue1' });
		expect(seen[1]).toEqual({ connectionId: 'queue1' });
	});

	it('does NOT propagate to bare EventEmitter listeners (documents the gotcha)', () => {
		// EventEmitter does not capture async context. A listener registered
		// inside an ALS frame, fired from outside, runs WITHOUT the frame.
		// This is the case for socket.on('end' | 'error') in the port routers
		// when the OS/libuv triggers the event — the emit happens in the
		// TCP wrap's async context, not the registration context.
		const emitter = new EventEmitter();
		const observed: Array<{ connectionId?: string }> = [];

		runWithLogContext({ connectionId: 'sock1' }, () => {
			emitter.on('data', () => {
				observed.push({ ...(getLogContext() ?? {}) });
			});
		});

		emitter.emit('data');
		expect(observed).toEqual([{}]);
	});

	it('bindLogContext re-enters the captured frame for an EventEmitter listener', () => {
		const emitter = new EventEmitter();
		const observed: Array<{ connectionId?: string }> = [];

		runWithLogContext({ connectionId: 'sock1' }, () => {
			emitter.on(
				'data',
				bindLogContext(() => {
					observed.push({ ...(getLogContext() ?? {}) });
				}),
			);
		});

		emitter.emit('data');
		emitter.emit('data');

		expect(observed).toEqual([
			{ connectionId: 'sock1' },
			{ connectionId: 'sock1' },
		]);
	});

	it('bindLogContext is a no-op when called outside any frame', () => {
		const fn = vi.fn();
		const wrapped = bindLogContext(fn);
		// Same identity — nothing to bind to
		expect(wrapped).toBe(fn);
	});
});

describe('wrapped logger merges ALS context', () => {
	it('emits no context fields outside a run frame', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		log.info('hello');

		expect(calls).toHaveLength(1);
		expect(calls[0]).toMatchObject({
			level: 'info',
			info: { message: 'hello', loggerName: 'mod' },
		});
		expect(calls[0]?.info['connectionId']).toBeUndefined();
		expect(calls[0]?.info['port']).toBeUndefined();
	});

	it('merges ALS context fields onto every log call inside the frame', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		runWithLogContext({ connectionId: 'abc', port: 8226 }, () => {
			log.info('first');
			log.debug('second', { detail: 'x' });
		});

		expect(calls[0]?.info).toMatchObject({
			connectionId: 'abc',
			port: 8226,
			message: 'first',
			loggerName: 'mod',
		});
		expect(calls[1]?.info).toMatchObject({
			connectionId: 'abc',
			port: 8226,
			message: 'second',
			detail: 'x',
			loggerName: 'mod',
		});
	});

	it('precedence: ALS < child bindings < per-call meta', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');
		const childLog = log.child({ port: 9999, handler: 'auth' });

		runWithLogContext({ connectionId: 'abc', port: 8226 }, () => {
			childLog.info('x', { handler: 'override', extra: 1 });
		});

		const info = calls[0]?.info ?? {};
		// connectionId came from ALS only — should survive
		expect(info['connectionId']).toBe('abc');
		// port: ALS=8226, child=9999 — child wins
		expect(info['port']).toBe(9999);
		// handler: child=auth, call=override — call wins
		expect(info['handler']).toBe('override');
		// extra came only from call meta
		expect(info['extra']).toBe(1);
	});

	it('mid-flight setLogContext updates show up on subsequent log calls', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		runWithLogContext({ connectionId: 'abc' }, () => {
			log.info('before persona');
			setLogContext({ personaId: 42 });
			log.info('after persona');
		});

		expect(calls[0]?.info['personaId']).toBeUndefined();
		expect(calls[1]?.info['personaId']).toBe(42);
		expect(calls[1]?.info['connectionId']).toBe('abc');
	});
});

describe('error normalization', () => {
	it('expands an Error passed via { err } into structured fields', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		const e = new Error('bang');
		log.error('Socket error', { err: e });

		const info = calls[0]?.info ?? {};
		expect(info['message']).toBe('Socket error');
		const err = info['err'] as Record<string, unknown>;
		expect(err['name']).toBe('Error');
		expect(err['message']).toBe('bang');
		expect(typeof err['stack']).toBe('string');
		expect(err['stack']).toContain('bang');
	});

	it('captures NodeJS.ErrnoException fields (code, errno, syscall)', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		const e = new Error('reset') as NodeJS.ErrnoException;
		e.code = 'ECONNRESET';
		e.errno = -104;
		e.syscall = 'read';

		log.error('Socket error', { err: e });

		const err = (calls[0]?.info ?? {})['err'] as Record<string, unknown>;
		expect(err['code']).toBe('ECONNRESET');
		expect(err['errno']).toBe(-104);
		expect(err['syscall']).toBe('read');
	});

	it('serializes nested Error causes', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		const root = new Error('inner reason');
		const wrapped = new Error('outer failure', { cause: root });

		log.error('boom', { err: wrapped });

		const err = (calls[0]?.info ?? {})['err'] as Record<string, unknown>;
		const cause = err['cause'] as Record<string, unknown>;
		expect(cause['message']).toBe('inner reason');
		expect(typeof cause['stack']).toBe('string');
	});

	it('handles an Error passed as the first argument directly', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');

		const e = new Error('direct');
		log.error(e);

		const info = calls[0]?.info ?? {};
		expect(info['message']).toBe('direct');
		const err = info['err'] as Record<string, unknown>;
		expect(err['message']).toBe('direct');
		expect(typeof err['stack']).toBe('string');
	});
});

describe('child loggers', () => {
	it('child bindings appear on every emitted record', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');
		const handler = log.child({ handler: 'openCommChannel' });

		handler.info('x');
		handler.warn('y', { detail: 1 });

		expect(calls[0]?.info['handler']).toBe('openCommChannel');
		expect(calls[1]?.info).toMatchObject({
			handler: 'openCommChannel',
			detail: 1,
		});
	});

	it('nested child() composes bindings', () => {
		const { fake, calls } = makeFakeWinston();
		const log = _createServerLoggerForTesting(fake, 'mod');
		const a = log.child({ a: 1 });
		const b = a.child({ b: 2 });
		const c = b.child({ b: 99 });

		c.info('x');

		expect(calls[0]?.info).toMatchObject({ a: 1, b: 99 });
	});
});

describe('end-to-end with real Winston pipeline', () => {
	it('ALS ctx + structured err survive the full Winston format pipeline', async () => {
		const { logger, transport } = makeMemoryLogger();
		const log = _createServerLoggerForTesting(logger, 'mod');

		const e = new Error('boom') as NodeJS.ErrnoException;
		e.code = 'EPIPE';

		runWithLogContext({ connectionId: 'abc', port: 8226 }, () => {
			log.error('handler crashed', { err: e });
		});

		// give Winston a tick to drain through the transport
		await new Promise((r) => setImmediate(r));

		expect(transport.records).toHaveLength(1);
		const r = transport.records[0]!;
		expect(r.level).toBe('error');
		expect(r['connectionId']).toBe('abc');
		expect(r['port']).toBe(8226);
		expect(r['message']).toBe('handler crashed');
		expect(r['loggerName']).toBe('mod');
		const err = r['err'] as Record<string, unknown>;
		expect(err['code']).toBe('EPIPE');
		expect(err['name']).toBe('Error');
		expect(err['message']).toBe('boom');
		expect(typeof err['stack']).toBe('string');
	});

	it('debug calls reach Winston at debug level (not aliased to verbose)', async () => {
		const { logger, transport } = makeMemoryLogger();
		const log = _createServerLoggerForTesting(logger, 'mod');

		log.debug('detail');
		await new Promise((r) => setImmediate(r));

		expect(transport.records).toHaveLength(1);
		expect(transport.records[0]?.level).toBe('debug');
	});
});
