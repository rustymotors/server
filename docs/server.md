# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

**_This server uses Docker and docker-compose_**

## Requirements

- Linux
  \*\* If you want to try running on Windows it may work, but I'm not going to support it
- NodeJS

### Configure server settings

- In `src/services/shared/config.json`, change the IP address to the external IP of the machine the server is running on;
- Locate the `sample.reg` file on `src/services/shared` folder, and modify all instances of `192.168.5.20` to be your server's DNS or IP.

## Installing

- `npm install`

- [Install Docker](https://docs.docker.com/install/)
- [Install docker-compose](https://docs.docker.com/compose/install/)

### Running

- `npm start`

This will start the server running on Docker

Afterwards, run `npm run migrate` to create the database before trying to connect
