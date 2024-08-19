# Domains

-   Web
-   Network
-   Account
-   Login
-   Persona
-   Lobby
-   Database

## Web

The web service is an HTTP/HTTPS server that provides the following external endpoints:

-   A binary response to the GET patch URL
-   A binary response to the GET update URL
-   A POST receive of a username and password using HTTPS which returns a Ticket code if valid, and an error if not
-   A response to the GET shardlist URL

### AuthLogin

Accept a username and password via HTTPS and requestions from the Account service if the login is valid.

Has the following service relationships:

-   Account OUTBOUND (username, password)
-   Account INBOUND (isUserValid)

### Shard

The shard service responds to a GET call and requests a list of online lobby servers (shards) from the Lobby service.

Has the following service relationships:

-   Lobby OUTBOUND
-   Lobby INBOUND (shardList)

## Network

The Network service handles all inbound and outbound non-HTTP TCP traffic between the server and clients. It has the following subdomains:

-   Socket Receive
-   Socket Send
-   Session Control
-   Interservice Transfer

### Socket receive

Receives inbound TCP traffic for the Login, Persona, Lobby, and Databse services. On initial connection from a client, the Socket Receive subdomain assigns the socket a socketId value, which it stores alongside the socket in an internal table. It then passes the socketId, along with the remoteAddress and localPort to the Session Control subdomain, which assigns the socketId a sessionId, and returns the pair.

Incoming data received on the connection (dataBuffer) is then sent to the InterService Transfer subdomain, along with the sessionId, to be routed to the correct domain for processing.

After the downstream domain finishes with the data, it returns any responses to the Socket Send subdomain via the Interservice Transfer subdomain to reverse the lookup flow and return to the client via the Socker Send subdomain.

Has the following service relationships:

-   Session Control OUTBOUND (socketId, remoteAddress, localPort)
-   Session Control INBOUND {socketId, SessionId}
-   Interservice Transfer OUTBOUND (sessionId, dataBuffer)

### Socket Send

Has the following service relationships:

-   Interservice Transfer INBOUND (sessionId, dataBuffer)
-   Session Control OUTBOUND (sessionId)
-   Session Control INBOUND (sessionId, socketId)

### Session Control

Has the following service relationships:

-   Socket Receive INBOUND (socketId, remoteAddress, localPort)
-   Socket Receive OUTBOUND (socketId, sessionId)
-   Socket Send INBOUND (sessionId)
-   Socket Send OUTBOUND (sessionId, socketId)

### Interservice Transfer

Has the following service relationships:

-   Socket Receive INBOUND (sessionId, dataBuffer)
-   Socket Send OUTBOUND (sessionId, dataBuffer)
-   Login OUTBOUND (sessionId, dataBuffer)
-   Login INBOUND (sessionId, dataBuffer)
-   Persona OUTBOUND (sessionId, dataBuffer)
-   Persona INBOUND (sessionId, dataBuffer)
-   Lobby OUTBOUND (sessionId, dataBuffer)
-   Lobby INBOUND (sessionId, dataBuffer)
-   Database OUTBOUND (sessionId, dataBuffer)
-   Database INBOUND (sessionId, dataBuffer)

## Account

Has the following service relationships:

-- TODO --

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
