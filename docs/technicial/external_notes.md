# External notes

## Definitions

User. Someone who owns the original game software and wants to play the game.

Client. The game software, as owned and ran by a user.

Server. The mcos codebase, consisting of the different components needed to maintain the connections needed for Users to play the game on the Client.

Original Server. The server system that was ran by the game manufacture, at the time the Client was being sold to the Users.

Server Operator. Someone who is running an instance of the Server, either privately or publicly.

Developer. Someone working on the Server development.

## Original Server

The Original Server, as ran by it's original owners, consisted of serveral distinct parts.

### Patch

This service served the Client's files, as well as any updates to the local database stored in the Client's directory

### Auth

This SSL service was connected to the customer database of the Original Server, and would return an session token (Context) to the Client when passed a valid username and password for a User.

### Shard

This SSL service would return a list of availiable Origional Server clusters (Shard), and provide the host and port for the login and lobby servers.

### Login

This TCP service was the first stage of connection a Shard. It would be provided a 128-byte RC4 key (Session Key) in hex, that was encrypted by a 1024-bit RSA key, by the Client. The RSA key used for the encryption was always known, since it was a part of the Client, and stored in the Client's directory in DER format.

Provided the Context provided to the Login server matched one known to the Auth server as beloming to a valid User, the Login server would store the Session Key with the matching customer id (Customer ID), mark the User as logged in, and return the Customer Id to the Client.

### Persona

This TCP service held the User game characters (Persona). Provided the User had played prior, the Client would then request a list of Personas that belonged to a Customer Id. The User would select one on the Client, and that Persona would be marked as "in use" by the Persona server. The client would then connection the client to the lobby server.

### Lobby

This TCP service might have been the first one that the User was aware of. Known by several names by the developers of the Origional Server, the Lobby server was the central hub of the game where the User chatted, traded, and raced with other Users. There were other sections of the lobby, such as auctions, garage, race rooms, etc, but they were all on the Lobby server.

After the inital login by the Client with a Customer Id and a Persona, the Session Key was fetched, used to generate a DES-CBC encryption key (SKey), and all following packets were encrypted using the SKey.

### MCOTS

This TCP service was also know as the database to Users. It held and managed all global Origional Server information, such as number and state of Shards, Users, races, events, auctions, etc.

After a inital login request with a Customer Id, User name, and Persona id and name, all following packets were encrypted using the full Session Key, which was fetched from the Login server's database. It in import to note that the Session Key was only provided one in the entire Client session, and shared within the Original Server for all future connections.

## Packet types

There are two types of packets that the Client used to communicate with the TCP services of the Origional System

### Game Packet

The Game Packet was used to communicate with the Login, Persona, and Lobby services.

### Transaction Packet

The Tranaction Packet was used to communicate with the MCOTS service.

## Ports

The follow ports on either on either the Origional Server or Server need to be opens for connections from the Client:

-   Login (defaults to 8226) - passed to the Client as part of a Shard entry
-   Persona (8228) - static, unpublished, and unable to be changed
-   Lobby (defaults to 7003) - passed to the Client as part of a Shard entry
-   MCOTS (43300) - static, unpublished, and unable to be changed

It can be noted there are fixed and flexible ports listed.

## Server

This section refers to the mcos codebase, as defined above.

I think that I want two servers.

-   SSL - Patch, Auth, Shard
-   TCP - Login, Persona, Lobby, new MCOTS (Transacation)

Limiting the Client's connection points for each protocol will simplify the socket-based part of the connection, which will be the hardest to test.
