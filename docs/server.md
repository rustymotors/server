# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

- Linux
  \*\* If you want to try running on Windows it may work, but I'm not going to support it
- NodeJS

### Configure server settings

- In `src/services/shared/config.json`, change the IP address to the external IP of the machine the server is running on;

- Generate the SSL cert and keys using `scripts/make_certs.sh`

## Installing

- `npm install`

### Ports

You will need to open the following ports:

- 80
- 443
- 6660
- 7003
- 8226
- 8227
- 8228
- 43200
- 43300
- 43400
- 53303
- 9000
- 9001
- 9002
- 9003
- 9004
- 9005
- 9006
- 9007
- 9008
- 9009
- 9010
- 9011
- 9012
- 9013
- 9014

- 88 - Admin UI (optional)

### Running

Enable Node to use port 80 and 443: `make enable-node`

- `npm start`

This will start the server
