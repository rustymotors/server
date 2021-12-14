"use strict";
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const persona_server_1 = require("../src/services/PersonaServer/persona-server");
const nps_msg_1 = require("../src/services/MCOTS/nps-msg");
const message_node_1 = require("../src/services/MCOTS/message-node");
const net_1 = require("net");
globals_1.jest.mock('net');
let personaServer;
globals_1.describe('Persona Server', () => {
    globals_1.beforeEach(() => {
        personaServer = persona_server_1.PersonaServer.getInstance();
    });
    globals_1.it('PersonaServer Methods', async () => {
        const results = await personaServer.getPersonasByCustomerId(5_551_212);
        globals_1.expect(results.length).toEqual(2);
        const name = results[0].name.toString('utf8');
        globals_1.expect(name).toContain('Dr Brown');
        const personas = await personaServer.getPersonaMapsByCustomerId(5_551_212);
        const id1 = personas[0].id;
        const name1 = personas[0].name;
        globals_1.expect(id1.readInt32BE(0)).toEqual(8_675_309);
        globals_1.expect(name1.toString('utf8').length).toEqual(30);
        await globals_1.expect(personaServer.getPersonasByCustomerId(123_654)).rejects.toThrowError(/Unable to locate a persona/);
    });
    globals_1.it('PersonaServer _npsSelectGamePersona()', async () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT).serialize();
        const results = await personaServer.handleSelectGamePersona(data);
        globals_1.expect(results.direction).toEqual(message_node_1.EMessageDirection.SENT);
    });
    globals_1.it('PersonaServer _npsNewGameAccount()', async () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT).serialize();
        const results = await personaServer.createNewGameAccount(data);
        globals_1.expect(results.direction).toEqual(message_node_1.EMessageDirection.SENT);
    });
    globals_1.it('PersonaServer _npsLogoutGameUser()', async () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT).serialize();
        const results = await personaServer.logoutGameUser(data);
        globals_1.expect(results.direction).toEqual(message_node_1.EMessageDirection.SENT);
    });
    globals_1.it('PersonaServer _npsCheckToken()', async () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT).serialize();
        const results = await personaServer.validateLicencePlate(data);
        globals_1.expect(results.direction).toEqual(message_node_1.EMessageDirection.SENT);
    });
    globals_1.it('PersonaServer _npsValidatePersonaName()', async () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT).serialize();
        const results = await personaServer.validatePersonaName(data);
        globals_1.expect(results.direction).toEqual(message_node_1.EMessageDirection.SENT);
    });
    globals_1.it('PersonaServer _send()', () => {
        const data = new nps_msg_1.NPSMessage(message_node_1.EMessageDirection.SENT);
        globals_1.expect(() => {
            personaServer.sendPacket(new net_1.Socket(), data);
        }).not.toThrow();
    });
    globals_1.it('PersonaServer _npsGetPersonaMapsByCustomerId()', async () => {
        const personas1 = await personaServer.getPersonaMapsByCustomerId(2_868_969_472);
        globals_1.expect(personas1.length).toEqual(1);
        globals_1.expect(personas1[0].name.toString('utf8')).toContain('Doc Joe');
        const personas2 = await personaServer.getPersonaMapsByCustomerId(4);
        globals_1.expect(personas2.length).toEqual(0);
    });
});
//# sourceMappingURL=persona-server.test.js.map