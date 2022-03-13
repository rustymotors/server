/**
 * SSLv2 "server"
 * Following https://web.archive.org/web/20220303012053/https://www-archive.mozilla.org/projects/security/pki/nss/ssl/draft02.html
 */

import net, { Socket } from "net";
import { Client } from 'pg';


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
  'NEW_CONNECTION' = 'new connection',
  'ERRORED_CONNECTION' = 'errored connection',
  'CLIENT-HELLO' = 'client hello',
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

}

class SSLConnectionRecord {
  public connectionState: SSLConnectionState = SSLConnectionState["CLIENT-HELLO"]
  public id: string = "";
  public sock: Socket;

  /**
   * createConnectionId
   * Given a Socket, returns a formatted string
   */
  public static createConnectionId(socket: Socket): string {
    return `${socket.remoteAddress}_${socket.remotePort?.toString(10) || "0"}`;
  }

  constructor(socket: Socket) {
    this.connectionState = SSLConnectionState.NEW_CONNECTION
    this.sock = socket;
    this.id = SSLConnectionRecord.createConnectionId(socket);
  }

}

  /**
   * closeWithError
   * Closes the underlying Socket, returns an optional error
   */
   const closeWithError = (sock: Socket, error?: string): never => {
    sock.end();
    console.error(error)
    process.exit(-1)
  }

  /**
 * 
 * @param {Buffer} data 
 * @private
 * @returns 
 */
   const processIncomingData = (connectionRecord: SSLConnectionRecord, data: Buffer) => {
    const firstByte = data[0];

    const dataContentType = _checkContentType(firstByte);
  
    if (dataContentType !== "Unknown") {
      closeWithError(connectionRecord.sock, 
        `Detected packet as valid TLS, ignoring and closing the socket`
      ); 
    }
  
    console.log(_checkContentType(firstByte));
  
    console.log(`MSB of first byte is set: ${Boolean(data[0] && 0x80)}`);
  
    const sslRecord: SSLRecord = {
      totalHeaderLengthInBytes: data[0] && 0x80 ? 2 : 3,
    };
  
    const recordLength = ((data[0] & 0x7f) << 8) | data[1];

    // Get the current connection state
    const connectionState = connectionRecord.connectionState
    console.log(`Current conection state: ${connectionState}`)

    if (connectionState === SSLConnectionState["CLIENT-HELLO"]) {
      
    }
  
    sslRecord.bodyBytes = parseRecordBody(
      data,
      sslRecord.totalHeaderLengthInBytes
    );
  
    console.log(_bufferToString(data));
  
    console.dir(sslRecord);
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
    processIncomingData(connectionRecord, data)
  });
}

const client = new Client()

async function main() {

  await client.connect()
  
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  console.log(res.rows[0].message) // Hello world!
  await client.end()
  
  const server = net.createServer(_listener);
  
  server.on("error", (err) => {
    console.error(`There was an error: ${err.message}`)
    throw err;
  });
  server.listen(443, () => {
    console.log("server bound");
  });
  
  process.on('uncaughtException', err => {
    console.error(`Uncaught Exception!`)
    process.exitCode = -1
    console.error(err.message)
    console.error(err.stack)
  })
}

main()

