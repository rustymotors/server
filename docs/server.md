# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.


## Requirements

* Linux
** If you want to try running on Windows it may work, but I'm not going to support it
* Docker (optional, but only if you want to run Postgres manually)
* NodeJS 8

## Installing

* `npm install`
* `./scripts/make_certs.sh`

### Ports needed to be forwarded

* 43300
* 8226
* 8228
* 7003

### Running

* `npm start`
