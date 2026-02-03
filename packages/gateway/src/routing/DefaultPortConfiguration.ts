// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type { PortRouter } from "../types.js";
import type { IPortRouterRegistry } from "./PortRouterRegistry.js";

/**
 * Creates the default port configuration for the Gateway server
 *
 * This function registers all the standard ports used by the game server:
 * - NPS (Network Play System) ports: 8226, 8227, 8228, 7003, 9000-9020, 10001
 * - MCOTS (Motor City Online Transaction Server) port: 43300
 *
 * @param registry - The port router registry to register ports in
 * @param npsRouter - The router function for NPS ports
 * @param mcotsRouter - The router function for MCOTS ports
 */
export function createDefaultPortConfiguration(
	registry: IPortRouterRegistry,
	npsRouter: PortRouter,
	mcotsRouter: PortRouter,
): void {
	// NPS ports - single ports
	registry.registerPort(8226, npsRouter);
	registry.registerPort(8227, npsRouter);
	registry.registerPort(8228, npsRouter);
	registry.registerPort(7003, npsRouter);
	registry.registerPort(10001, npsRouter);

	// NPS ports - range (9000-9020 inclusive)
	registry.registerPortRange(9000, 9020, npsRouter);

	// MCOTS port
	registry.registerPort(43300, mcotsRouter);
}
