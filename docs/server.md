# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

- Linux
  \*\* If you want to try running on Windows it may work, but I'm not going to support it
- NodeJS
- [Docker](https://docs.docker.com/compose/install/) (A way to see the logs of the node pod would be very helpful if you need to file a bug report)

### Configure server settings

- In `packages/mcos-shared/config/index.js`, change the IP address for all `*_EXTERNAL_HOST` values to the external IP of the machine the server is running on

- Generate the SSL cert and keys using `make certs`

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
- 9000 - 9014 (not yet used, I think they are for UDP client racing


### Running

Enable Node to use port 80 and 443: `make enable-node`

- `nmake prod_node`

This will start the server cluster which involves the database, SSL gateway, and server(s)

🤞 If someththing explodes, open an issue or ping me on Discord. I might have forgoten a step.
