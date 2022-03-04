/**
 * SSLv2 "server"
 * Following https://web.archive.org/web/20220303012053/https://www-archive.mozilla.org/projects/security/pki/nss/ssl/draft02.html
 */

import net, { Socket } from 'net';

function _bufferToString(data: Buffer) {
    let outputStringArray: string[] = []
    for (let index = 0; index < data.length; index++) {
        outputStringArray.push(`0x${data[index].toString(16).padStart(2, '0')}`);        
    }
    return outputStringArray.join(', ')
}

interface SSLRecord {
    totalHeaderLengthInBytes: 2 | 3
    bodyBytes?: Buffer
}

function parseRecordBody(data: Buffer, bodyOffset: number) {
    return data.slice((bodyOffset))
}

function _checkContentType(firstByte: number) {
    if (firstByte === 20) { // 0x14
        return 'TLS Change Cypher Spec'
    }
    if (firstByte === 21) { // 0x15
        return 'TLS Alert'
    }
    if (firstByte === 22) { // 0x16
        return 'TLS Handshake'
    }
    if (firstByte === 23) { // 0x17
        return 'TLS Application Data'
    }
    return 'Unknown'
}


function _onData(data: Buffer, socket: Socket) {

    const firstByte = data[0]

    const dataContentType = _checkContentType(firstByte)

    if (dataContentType !== 'Unknown') {
        console.log(`Detected packet as valid TLS, ignoring and closing the socket`);
        socket.end()
        return
    }
    
    console.log(_checkContentType(firstByte));
    

    console.log(`MSB of first byte is set: ${Boolean(data[0] && 0x80)}`); 

    const sslRecord: SSLRecord = {
        totalHeaderLengthInBytes: (data[0] && 0x80) ? 2 : 3
    }

    const recordLength = ((data[0] & 0x7f) << 8) | data[1]

    sslRecord.bodyBytes = parseRecordBody(data, sslRecord.totalHeaderLengthInBytes)
    
    console.log(_bufferToString(data));
    

    console.dir(sslRecord)
}

const server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
      console.log("client disconnected\n\n");
    });
    c.on("data", (data) => {
      _onData(data, c);
    });
  });
  server.on('error', (err) => {
    throw err;
  });
  server.listen(443, () => {
    console.log('server bound');
  });

