// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {Socket} from 'net';
import {expect} from 'chai';
import pkg from 'sinon';
import logger from '@drazisil/mco-logger';
import {ConnectionMgr} from '../src/services/MCServer/ConnectionMgr.js';
import {ConnectionObj} from '../src/services/MCServer/ConnectionObj.js';
const {mock, createStubInstance} = pkg;

/* eslint-env mocha */

const fakeLogger = mock(logger);
fakeLogger.expects('log').withArgs().atLeast(1);

// TODO: REplace with testdouble
const fakeConnectionManager = createStubInstance(ConnectionMgr);

it('ConnectionObj', () => {
	const testConnection = new ConnectionObj(
		'abc',
		new Socket(),
		fakeConnectionManager
	);

	expect(testConnection.status).equals('Inactive');
	expect(testConnection.isSetupComplete).is.false;
	testConnection.setEncryptionKey(Buffer.from('abc123', 'hex'));
	expect(testConnection.isSetupComplete).is.true;
});

it('ConnectionObj cross-comms', () => {
	/** @type {ConnectionObj} */
	let testConn1;
	/** @type {ConnectionObj} */
	let testConn2;

	beforeEach(() => {
		testConn1 = new ConnectionObj('def', new Socket(), fakeConnectionManager);
		testConn2 = new ConnectionObj('ghi', new Socket(), fakeConnectionManager);
		testConn1.setEncryptionKey(Buffer.from('abc123', 'hex'));
		testConn2.setEncryptionKey(Buffer.from('abc123', 'hex'));
	});

	const plainText1 = Buffer.from(
		'I\'m a very a secret message. Please don\'t decode me!'
	);
	const cipherText1 = Buffer.from([
		0x71,
		0xF2,
		0xAE,
		0x29,
		0x91,
		0x8D,
		0xBA,
		0x3D,
		0x5E,
		0x6C,
		0x31,
		0xB0,
		0x3A,
		0x58,
		0x82,
		0xA3,
		0xDD,
		0xB9,
		0xEC,
		0x5D,
		0x3E,
		0x82,
		0xD4,
		0x4F,
		0xC0,
		0xE5,
		0xE5,
		0x39,
		0x03,
		0xBA,
		0x1C,
		0x19,
		0xC4,
		0x16,
		0x03,
		0x68,
		0xFF,
		0xC9,
		0x6F,
		0x72,
		0xE4,
		0x94,
		0x27,
		0x40,
		0x46,
		0x47,
		0x56,
		0xF0,
		0x79,
		0x70,
		0xBF,
		0x45
	]);

	it('Connection one is not the same id as connection two', () => {
		expect(testConn1.enc.getId()).is.not.equal(testConn2.enc.getId());
	});

	it('Connection Two can decipher Connection One', () => {
		expect(testConn1.enc).is.not.null;
		const encipheredBuffer = testConn1.enc.encrypt(plainText1);
		expect(encipheredBuffer).to.deep.equal(cipherText1);
		expect(testConn2.enc).is.not.null;
		expect(testConn1.enc.decrypt(encipheredBuffer)).deep.equals(plainText1);
		expect(testConn2.enc.decrypt(encipheredBuffer)).deep.equals(plainText1);

		// Try again
		const encipheredBuffer2 = testConn1.enc.encrypt(plainText1);
		expect(testConn1.enc.decrypt(encipheredBuffer2)).deep.equals(plainText1);
		expect(testConn2.enc.decrypt(encipheredBuffer2)).deep.equals(plainText1);

		// And again
		const encipheredBuffer3 = testConn1.enc.encrypt(plainText1);
		expect(testConn1.enc.decrypt(encipheredBuffer3)).deep.equals(plainText1);
		expect(testConn2.enc.decrypt(encipheredBuffer3)).deep.equals(plainText1);
	});
});
