var mcoServer = require('./src/mco_server/index.js')

var SERVER_PORTS = ['8226', '8228', '7003']

mcoServer.init()
mcoServer.start(SERVER_PORTS)
