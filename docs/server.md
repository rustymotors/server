# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

- Linux
  \*\* If you want to try running on Windows it may work, but I'm not going to support it
- Docker (optional, but only if you want to run Postgres manually)
- NodeJS

### Configure server settings

In `src/services/shared/config.json`, change the IP address to the external IP of the machine the server is running on

## Installing

- `npm install`
- `./scripts/make_certs.sh`

### Ports needed to be forwarded

- 80
- 443
- 43300
- 8226
- 8228
- 7003

### Permission to bind to low ports (on linux)

`sudo setcap cap_net_bind_service=+ep $(which node)`

### Running

- `npm start`
