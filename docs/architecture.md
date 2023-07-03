# Dev Architecture

## Libraries Used

    "c-struct": "0.0.5",

Used for LoginMsg and NPSPersonaMapsMsg

    "express": "^4.17.1",

Used for the HTTP(S) servers for AuthLogin, Patch and Shard

    "sqlite": "^3.0.3",

Used for the database

    "winston": "^3.2.1"

Used for logging

## Service Modules

### Patch

This is an HTTP server that simulates a Castanet server and returns a response indicating the game is fully patched.

### AuthLogin

This is an HTTPS server that handled login with username and password. It would normally connect to the billing server. It checks for a "valid" login and return a ticke that is needed by the Login service.

### Shard

This is an HTTP server that returns a shardlist for the game's main selection screen. It is currently static. Normally it would return live status information of the number of players and the status for each shard. It is currently merged with the [Patch Server](#Patch).

### Persona

This is a TCP server that accepts the ticket returned from the [AuthLogin Server](#AuthLogin) and returns a list of personas for that player. The player selects a persona and requests the persona server to mark it in use.

### Login

This is a TCP server that takes the ticket from the [AuthLogin Server](#AuthLogin) and the persona name from the [Persona Server](#Persona) and tells the [Game Server](#Game) that the player is logging in.

### Game Server (also called Lobby Server)

This is the "Shard" where players mingle, and prep for races. Contains most gameplay, excepting the actual races.

### Room Server

This is the server where all races take place, one for each race. Not sure if this is a pysically seperate server normally, or a compartment of the [Game Server](#Game)

### Admin Server

This is an interface to view connection records and bans.
