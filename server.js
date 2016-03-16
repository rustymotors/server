var loginServer = require('./login/server.js')
var personaServer = require('./persona/server.js')
var gameServer = require('./game/server.js')

loginServer.initServer()
personaServer.initServer()
gameServer.initServer()
