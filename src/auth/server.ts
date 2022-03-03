/**
 * SSLv2 "server"
 * Following https://web.archive.org/web/20220303012053/https://www-archive.mozilla.org/projects/security/pki/nss/ssl/draft02.html
 */

import net from 'net';

function _bufferToString(data: Buffer) {
    let outputStringArray: string[] = []
    for (let index = 0; index < data.length; index++) {
        outputStringArray.push(`0x${data[index].toString(16).padStart(2, '0')}`);        
    }
    return outputStringArray.join(', ')
}

interface SSLRecordHeader {
    totalHeaderLengthinBytes: 2 | 3
}

function _onData(data: Buffer) {
    console.log(`MSB of first byte is set: ${Boolean(data[0] && 0x80)}`);

    const recordHeader: SSLRecordHeader = {
        totalHeaderLengthinBytes: (data[0] && 0x80) ? 2 : 3
    }
    
    console.log(_bufferToString(data));

    console.dir(recordHeader)
}

const server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
      console.log("client disconnected\n\n");
    });
    c.on("data", (data) => {
      _onData(data);
    });
  });
  server.on('error', (err) => {
    throw err;
  });
  server.listen(443, () => {
    console.log('server bound');
  });