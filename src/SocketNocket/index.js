function watchEmitter(emitter) {
  // Insert a new listener in front
  emitter.prependOnceListener('connection', (sock) => {
    sock.prependOnceListener('data', (data) => {
      // eslint-disable-next-line no-console, no-underscore-dangle
      console.log('Sock: ', sock._sockname, sock._server._connectionKey);
      // eslint-disable-next-line no-console
      console.log(`Data: ${data}`);

      // Quit while ahead
      process.exit();
    });
  });
}

module.exports = { watchEmitter };
