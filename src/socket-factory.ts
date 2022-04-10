import type { Socket } from "net";
import { Duplex, EventEmitter } from "stream";

/**
 * Generate test objects that match the signature of net.Socket
 *
 * @export
 * @class SocketFactory
 * @extends {Duplex}
 * @implements {EventEmitter}
 */
export class SocketFactory extends Duplex implements EventEmitter {

  /**
   * Generate a fake "socket" onbject for testing
   *
   * @static
   * @return {*}  {Socket}
   * @memberof SocketFactory
   */
  static createSocket(): Socket {
    const duplex = new Duplex();

    const self: Socket = Object.assign({}, duplex, {
      localPort: 7003,
      write: () => true,
      connect: () => self,
      setEncoding: () => self,
      pause: () => self,
      resume: () => self,
      setTimeout: () => self,
      setNoDelay: () => self,
      setKeepAlive: () => self,
      address: () => {
        return { address: "", family: "", port: 0 };
      },
      unref: () => self,
      ref: () => self,
      bufferSize: 0,
      bytesRead: 0,
      bytesWritten: 0,
      connecting: false,
      localAddress: "",
      end: () => self,
      addListener: () => self,
      emit: () => false,
      on: () => self,
      once: () => self,
      prependListener: () => self,
      prependOnceListener: () => self,
      _write: () => self,
      _destroy: () => self,
      _final: () => self,
      setDefaultEncoding: () => self,
      cork: () => self,
      uncork: () => self,
      _read: () => self,
      read: () => self,
      isPaused: () => false,
      unpipe: () => self,
      unshift: () => self,
      wrap: () => self,
      push: () => true,
      destroy: () => {
        return;
      },
      removeListener: () => self,
      [Symbol.asyncIterator](): AsyncIterableIterator<string> {
        return {
          [Symbol.asyncIterator](): AsyncIterableIterator<string> {
            if (this.return !== undefined) {
              this.return("foo").then(
                () => {
                  // do nothing.
                },
                () => {
                  // do nothing.
                }
              );
            }
            return this;
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          next(): Promise<IteratorResult<string, string>> {
            return new Promise(() => {
              // do nothing.
            });
          },
        };
      },

      pipe<T extends NodeJS.WritableStream>(destination: T): T {
        return destination;
      },
    });

    return self;
  }
}
