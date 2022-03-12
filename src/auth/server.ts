/**
 * SSLv2 "server"
 * Following https://web.archive.org/web/20220303012053/https://www-archive.mozilla.org/projects/security/pki/nss/ssl/draft02.html
 */

import net, { Socket } from "net";


/**
 * Credit to https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/math/bits
 */

/**
 * @param number 
 * @param bitPosition 
 * @returns {1 || 0}
 */
export function getBit(number: number, bitPosition: number): number {
  return (number >> bitPosition) & 1;
}

/**
 * @param {number} number
 * @param {number} bitPosition - zero based.
 * @return {number}
 */
 export function setBit(number: number, bitPosition: number): number {
  return number | (1 << bitPosition);
}

function _bufferToString(data: Buffer) {
  let outputStringArray: string[] = [];
  for (let index = 0; index < data.length; index++) {
    outputStringArray.push(`0x${data[index].toString(16).padStart(2, "0")}`);
  }
  return outputStringArray.join(", ");
}

enum SSLConnectionState {
  "NEW_CONNECTION",
  "ERRORED_CONNECTION",
  "CLIENT-HELLO",
}

interface SSLRecord {
  totalHeaderLengthInBytes: 2 | 3;
  bodyBytes?: Buffer;
}

function parseRecordBody(data: Buffer, bodyOffset: number) {
  return data.slice(bodyOffset);
}

function _checkContentType(firstByte: number) {
  if (firstByte === 20) {
    // 0x14
    return "TLS Change Cypher Spec";
  }
  if (firstByte === 21) {
    // 0x15
    return "TLS Alert";
  }
  if (firstByte === 22) {
    // 0x16
    return "TLS Handshake";
  }
  if (firstByte === 23) {
    // 0x17
    return "TLS Application Data";
  }
  return "Unknown";
}

/**
 * 
 * @param {Buffer} data 
 * @param connectionRecord 
 * @private
 * @returns 
 */
function _onData(data: Buffer, connectionRecord: SSLConnectionRecord) {
  const firstByte = data[0];

  const dataContentType = _checkContentType(firstByte);

  if (dataContentType !== "Unknown") {
    const error = connectionRecord.closeWithError(
      `Detected packet as valid TLS, ignoring and closing the socket`
    );

    if (error) {
      console.error(error);
    }

    return;
  }

  console.log(_checkContentType(firstByte));

  console.log(`MSB of first byte is set: ${Boolean(data[0] && 0x80)}`);

  const sslRecord: SSLRecord = {
    totalHeaderLengthInBytes: data[0] && 0x80 ? 2 : 3,
  };

  const recordLength = ((data[0] & 0x7f) << 8) | data[1];

  sslRecord.bodyBytes = parseRecordBody(
    data,
    sslRecord.totalHeaderLengthInBytes
  );

  console.log(_bufferToString(data));

  console.dir(sslRecord);
}

class SSLConnectionRecord {
  private _socket: Socket;
  private _connectionState: SSLConnectionState = SSLConnectionState["CLIENT-HELLO"]
  private _id: string = "";

  get id() {
    return this._id;
  }

  /**
   * createConnectionId
   * Given a Socket, returns a formatted string
   */
  public static createConnectionId(socket: Socket): string {
    return `${socket.remoteAddress}_${socket.remotePort?.toString(10) || "0"}`;
  }

  constructor(socket: Socket) {
    this._connectionState = SSLConnectionState.NEW_CONNECTION
    this._socket = socket;
    this._id = SSLConnectionRecord.createConnectionId(socket);
  }

  /**
   * closeWithError
   * Closes the underlying Socket, returns an optional error
   */
  public closeWithError(error?: string): string | void {
    this._connectionState = SSLConnectionState.ERRORED_CONNECTION
    this._socket.end();
    return error;
  }
}

class SSLConnectionManager {
  private _connections: SSLConnectionRecord[] = [];

  private static _instance: SSLConnectionManager;

  private constructor() {
    // Intentionally empty
  }

  /**
   * getInstance
   * Returns the static instance of the class
   */
  public static getInstance(): SSLConnectionManager {
    if (typeof SSLConnectionManager._instance /*?*/ === "undefined") {
      SSLConnectionManager._instance = new SSLConnectionManager();
    }
    return SSLConnectionManager._instance; /*?*/
  }

  /**
   * addConnection
   * Add a new SSLConnection record
   */
  public addConnection(connection: SSLConnectionRecord): SSLConnectionRecord {
    this._connections.push(connection);
    return connection;
  }

  /**
   * getConnections
   * Returns the list of connections as a ReadOnly array
   */
  public getConnections(): Readonly<SSLConnectionRecord[]> {
    return Object.freeze(this._connections);
  }

  /**
   * findConnection
   * Find an exist connection record. Returns undefined if not found
   */
  public findConnection(id: string): SSLConnectionRecord | undefined {
    return this._connections.find((record) => {
      return record.id === id;
    });
  }
}

function _listener(listeningSocket: Socket) {
  console.log("client connected");

  // Get instance of SSLConnectionManager
  const connectionManager = SSLConnectionManager.getInstance();

  let connectionRecordId =
    SSLConnectionRecord.createConnectionId(listeningSocket);

  const connectionRecord: SSLConnectionRecord =
    connectionManager.findConnection(connectionRecordId) ||
    connectionManager.addConnection(new SSLConnectionRecord(listeningSocket));

  console.log(`We have a connection record for id: ${connectionRecord.id}`);

  listeningSocket.on("end", () => {
    console.log("client disconnected\n\n");
  });
  listeningSocket.on("data", (data) => {
    _onData(data, connectionRecord);
  });
}

const server = net.createServer(_listener);

server.on("error", (err) => {
  console.error(`There was an error: ${err.message}`)
  throw err;
});
server.listen(443, () => {
  console.log("server bound");
});
