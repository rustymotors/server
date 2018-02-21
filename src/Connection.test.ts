// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Socket } from "net";
import { Connection } from "./Connection";
import ConnectionMgr from "./connectionMgr";

let testConnection;

describe('Connection class', () => {

  beforeEach(() => {
    testConnection = new Connection(1, new Socket, new ConnectionMgr());
  });

  test('status == "inactive"', () => {
    expect(testConnection.status).toEqual('INACTIVE');
  });

  test('has no default encryption object"', () => {
    expect(testConnection.enc).toEqual({});
  });

  test('changes to setupComplete after setting key"', () => {
    expect(testConnection.isSetupComplete).toBeFalsy();
    testConnection.setEncryptionKey('abc123')
    expect(testConnection.isSetupComplete).toBeTruthy()
  });

  // describe('encrying and decrypting packets', () => {
  //   // Applies only to tests in this describe block
  //   beforeEach(() => {
  //     return initializeFoodDatabase();
  //   });

  //   test('Vienna <3 sausage', () => {
  //     expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(true);
  //   });

  //   test('San Juan <3 plantains', () => {
  //     expect(isValidCityFoodPair('San Juan', 'Mofongo')).toBe(true);
  //   });
  // });

});