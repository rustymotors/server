// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { expect } = require('chai')
const { MCOProxy } = require('./proxy')

/** @type {module:MCOProxy~IProxyListenerRequest[]} */
const testServerRequests = [
    {
        port: 80,
        protocol: 'http'
    },
    {
        port: 443,
        protocol: 'ssl'
    },
    {
        port: 8228,
        protocol: 'tcp'
    }
]

/** @type {module:MCOProxy~IProxyListenerRequest[]} */
const testServerRequestsBad = [
    {
        port: 666,
        protocol: 'udp'
    }
]

describe('MCOProxy', function() {

    it('should return an instance of itself when new() is called ', async function() {
        /** @type {MCOProxy} */
        const testProxy = await MCOProxy.new(testServerRequests)
        expect(testProxy.activeListeners.length).to.be.equal(3)
    })

    it('should throw when new() is passed a request with an invalid protocol field ', async function() {
        /** @type {MCOProxy} */
        MCOProxy.new(testServerRequestsBad)
        .catch(err => {
            expect(err).to.match(/Unsupported server type/)
        })
    })
})