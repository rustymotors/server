import {
    TServerLogger,
    ISocket,
    TPersonaRecord,
    IPersonaServer,
} from "mcos/shared/interfaces";
import { personaRecords } from "./internal.js";
import { NPSPersonaMapsMessage } from "./NPSPersonaMapsMessage.js";
import { NPSMessage, Sentry } from "mcos/shared";

/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {PersonaRecord[]} personaList
 */

export class PersonaServer implements IPersonaServer {
    /**
     *
     *
     * @static
     * @type {PersonaServer}
     * @memberof PersonaServer
     */
    static _instance: PersonaServer;

    /** @type {TServerLogger} */
    private readonly _log: TServerLogger;

    /**
     * PLease use getInstance() instead
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     * @memberof PersonaServer
     */
    constructor(log: TServerLogger) {
        this._log = log;
    }

    /**
     * Return the instance of the Persona Server class
     * @param {TServerLogger} log
     * @returns {PersonaServer}
     */
    static getInstance(log: TServerLogger): PersonaServer {
        if (typeof PersonaServer._instance === "undefined") {
            PersonaServer._instance = new PersonaServer(log);
        }
        return PersonaServer._instance;
    }

    /**
     * Create a new game persona record
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    async createNewGameAccount(data: Buffer): Promise<NPSMessage> {
        const requestPacket = new NPSMessage("received").deserialize(data);
        this._log(
            "debug",
            `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const rPacket = new NPSMessage("sent");
        rPacket.msgNo = 1537;
        this._log(
            "debug",
            `NPSMsg response object from _npsNewGameAccount',
      ${JSON.stringify({
          NPSMsg: rPacket.toJSON(),
      })}`
        );

        rPacket.dumpPacket();

        return rPacket;
    }

    //  TODO: #1227 Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
    //  TODO: #1228 Locate the connection and delete, or reset it.
    /**
     * Log out a game persona
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    async logoutGameUser(data: Buffer): Promise<NPSMessage> {
        this._log("debug", "[personaServer] Logging out persona...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        this._log(
            "debug",
            `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        // Create the packet content
        const packetContent = Buffer.alloc(257);

        // Build the packet
        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 1554;
        responsePacket.setContent(packetContent);
        this._log(
            "debug",
            `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );

        responsePacket.dumpPacket();

        this._log(
            "debug",
            `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    async validateLicencePlate(data: Buffer): Promise<NPSMessage> {
        this._log("debug", "_npsCheckToken...");
        const requestPacket = new NPSMessage("received").deserialize(data);
        this._log(
            "debug",
            `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );

        requestPacket.dumpPacket();

        const customerId = data.readInt32BE(12);
        const plateName = data.subarray(17).toString();
        this._log("debug", `customerId: ${customerId}`); // skipcq: JS-0378
        this._log("debug", `Plate name: ${plateName}`); // skipcq: JS-0378

        // Create the packet content
        const packetContent = Buffer.alloc(256);

        // Build the packet
        // NPS_ACK = 207
        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 519;
        responsePacket.setContent(packetContent);
        this._log(
            "debug",
            `NPSMsg response object from _npsCheckToken',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        this._log(
            "debug",
            `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     * Handle a get persona maps packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    async validatePersonaName(data: Buffer): Promise<NPSMessage> {
        this._log("debug", "_npsValidatePersonaName...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        this._log(
            "debug",
            `NPSMsg request object from _npsValidatePersonaName',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );
        requestPacket.dumpPacket();

        const customerId = data.readInt32BE(12);
        const requestedPersonaName = data
            .subarray(18, data.lastIndexOf(0))
            .toString();
        const serviceName = data.subarray(data.indexOf(10) + 1).toString(); // skipcq: JS-0377
        this._log(
            "debug",
            JSON.stringify({ customerId, requestedPersonaName, serviceName })
        );

        // Create the packet content
        // TODO: #1178 Return the validate persona name response as a MessagePacket object
        const packetContent = Buffer.alloc(256);

        // Build the packet
        // NPS_USER_VALID     validation succeeded
        const responsePacket = new NPSMessage("sent");
        responsePacket.msgNo = 1537;
        responsePacket.setContent(packetContent);

        this._log(
            "debug",
            `NPSMsg response object from _npsValidatePersonaName',
      ${JSON.stringify({
          NPSMsg: responsePacket.toJSON(),
      })}`
        );
        responsePacket.dumpPacket();

        this._log(
            "debug",
            `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
        );
        return responsePacket;
    }

    /**
     * Lookup all personas owned by the customer id
     *
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<PersonaRecord[]>}
     */
    async getPersonasByCustomerId(
        customerId: number
    ): Promise<TPersonaRecord[]> {
        return personaRecords.filter(
            (persona) => persona.customerId === customerId
        );
    }

    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    async getPersonaMaps(data: Buffer): Promise<NPSMessage> {
        this._log("debug", "_npsGetPersonaMaps...");
        const requestPacket = new NPSMessage("received").deserialize(data);

        this._log(
            "debug",
            `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );
        this._log(
            "debug",
            `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
          NPSMsg: requestPacket.toJSON(),
      })}`
        );
        requestPacket.dumpPacket();

        const customerId = Buffer.alloc(4);
        data.copy(customerId, 0, 12);
        const personas = await this.getPersonasByCustomerId(
            customerId.readUInt32BE(0)
        );
        this._log(
            "debug",
            `${personas.length} personas found for ${customerId.readUInt32BE(
                0
            )}`
        );

        const personaMapsMessage = new NPSPersonaMapsMessage("sent");

        if (personas.length === 0) {
            const err = new Error(
                `No personas found for customer Id: ${customerId.readUInt32BE(
                    0
                )}`
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        } else {
            try {
                personaMapsMessage.loadMaps(personas);

                const responsePacket = new NPSMessage("sent");
                responsePacket.msgNo = 1543;
                responsePacket.setContent(personaMapsMessage.serialize());
                this._log(
                    "debug",
                    `NPSMsg response object from _npsGetPersonaMaps: ${JSON.stringify(
                        {
                            NPSMsg: responsePacket.toJSON(),
                        }
                    )}`
                );

                responsePacket.dumpPacket();

                return responsePacket;
            } catch (error) {
                Sentry.captureException(error);
                if (error instanceof Error) {
                    const err = new TypeError(
                        `Error serializing personaMapsMsg: ${error.message}`
                    );
                    Sentry.addBreadcrumb({
                        level: "error",
                        message: err.message,
                    });
                    throw err;
                }

                const err = new Error(
                    "Error serializing personaMapsMsg, error unknonw"
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            }
        }
    }
}
/**
 * Return the instance of the Persona Server class
 * @param {TServerLogger} log
 * @returns {PersonaServer}
 */

export function getPersonaServer(log: TServerLogger): PersonaServer {
    return PersonaServer.getInstance(log);
}
