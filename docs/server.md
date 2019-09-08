# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

- Linux
  \*\* If you want to try running on Windows it may work, but I'm not going to support it
- NodeJS

### Configure server settings

- In `src/services/shared/config.json`, change the IP address to the external IP of the machine the server is running on;
- Locate the `sample.reg` file on `src/services/shared` folder, and modify all instances of `192.168.5.20` to be your server's DNS or IP.

## Installing

- `npm install`

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
