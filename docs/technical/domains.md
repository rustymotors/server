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

This is a stub service that serves a static response that does not depend on any other service. It's documented for completeness.

### Update

This is a stub service that serves a static response that does not depend on any other service. It's documented for completeness.

### AuthLogin

Has the following service relationships:

* Account OUTBOUND (username, password)
* Account INBOUND (isUserValid)

### Shard

Has the following service relationships:

* Lobby INBOUND (shardList)

## Network

* Socket Receive
* Socket Send
* Session Control
* Interservice Transfer

### Socket receive

Has the following service relationships:

* Session Control OUTBOUND (socketId, remoteAddress, localPort)
* Session Control INBOUND {socketId, SessionId}
* Interservice Transfer OUTBOUND (sessionId, dataBuffer)

### Socket Send

Has the following service relationships:

* Interservice Transfer INBOUND (sessionId, dataBuffer)
* Session Control OUTBOUND (sessionId)
* Session Control INBOUND (sessionId, socketId)

### Session Control

Has the following service relationships:

* Socket Receive INBOUND (socketId, reportAddress, localPort)
* Socket Receive OUTBOUND (socketId, sessionId)
* Socket Send INBOUND (sessionId)
* Socket Send OUTBOUND (sessionId, socketId)

### Interservice Transfer

Has the following service relationships:

* Socket Receive INBOUND (sessionId, dataBuffer)
* Socket Send OUTBOUND (sessionId, dataBuffer)
* Login OUTBOUND (sessionId, dataBuffer)
* Login INBOUND (sessionId, dataBuffer)
* Persona OUTBOUND (sessionId, dataBuffer)
* Persona INBOUND (sessionId, dataBuffer)
* Lobby OUTBOUND (sessionId, dataBuffer)
* Lobby INBOUND (sessionId, dataBuffer)
* Database OUTBOUND (sessionId, dataBuffer)
* Database INBOUND (sessionId, dataBuffer)

## Login

Has the following service relationships:

-- TODO --

## Persona

Has the following service relationships:

-- TODO --

## Lobby

Has the following service relationships:

-- TODO --

## Database

Has the following service relationships:

-- TODO --
