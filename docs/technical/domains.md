# Domains

* Web
* Network
* Account
* Login
* Persona
* Lobby
* Database

## Web

* Patch
* Update
* AuthLogin
* Shard

### Patch

Does not need to talk to any other domains

### Update

Does not need to talk to any other domains

### AuthLogin

Connects to

* Account -> (username, password)
* Account <- (isUserValid)

### Shard

Connects to

* Lobby <- (shardList)

## Network

* Socket Receive
* Socket Send
* Session Control
* Interservice Transfer

### Socket receive

* Session Control -> (socketId, remoteAddress, localPort)
* Session Control <- {socketId, SessionId}
* Interservice Transfer -> (sessionId, dataBuffer)

### Socket Send

* Interservice Transfer <- (sessionId, dataBuffer)
* Session Control -> (sessionId)
* Session Control <- (sessionId, socketId)

### Session Control

* Socket Receive <- (socketId, reportAddress, localPort)
* Socket Recieve -> (socketId, sessionId)
* Socket Send <- (sessionId)
* Socket Send -> (sessionId, socketId)

### Interservice Transfer

* Socket Receive <- (sessionId, dataBuffer)
* Socket Send -> (sessionId, dataBuffer)
* Login -> (sessionId, dataBuffer)
* Login <- (sessionId, dataBuffer)
* Persona -> (sessionId, dataBuffer)
* Persona <- (sessionId, dataBuffer)
* Lobby -> (sessionId, dataBuffer)
* Lobby <- (sessionId, dataBuffer)
* Database -> (sessionId, dataBuffer)
* Database <- (sessionId, dataBuffer)

## Login

-- TODO --

## Persona

-- TODO --

## Lobby

-- TODO --

## Database

-- TODO --