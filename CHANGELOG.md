## 2.0.0

- forgot to update changelog, a lot
- moved serves back into a monolith of sorts
- switched from yaml to json (which I guess probably makes this non-backwarsd compatable)
- noted the database change from postgres to sqlite in 1.4.3 is breaking as well
- added more code coverage

### 1.4.4

- upgraded a bunch of things
- remove unused ts-node
- add an npm stop script

### 1.4.3

- switch database from postgres to sqlite

### 1.3.3

- remove unneeded POSTGRESS_USER env
- add dev values to .env.example

### 1.3.2

- convert the patch and shard servers to services

### 1.3.1

- add /registry endpoint to download registry file
- remove check for old version of NodeJS

### 1.3.0 (Start of changelog)

- Client clears patch and update server (port 80)
- Client clears the login web server (port 443)
- Client clears the login server (port 8226)
- Client clears the persona server (port 8228)
- Client clears the lobby/room server (port 7003) and decrypts the NPS packets sent after
- Client passes client connect to MCOTS (port 43300) ands decrypt the packets sent after
