// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { expect } = require('chai')
const { MCOProxy } = require('./proxy')

/** @type {module:MCOProxy~IProxyListenerRequest[]} */
const testRequestList = [
    {
        port: 444,
        protocol: 'tcp'
    }
] 

describe('MCOProxy', function() {

    it('should return an instance of itself when new() is called ', async function() {
        /** @type {MCOProxy} */
        const testProxy = await MCOProxy.new(testRequestList)
        expect(testProxy.activeListeners.length).to.be.equal(1)
    })
})