# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

* Linux
** If you want to try running on Windows it may work, but I'm not going to support it
* Docker (optional, but only if you want to run Postgres manually)
* NodeJS

## Configure Environment Variables

Create a `.env` file at the root of your repository.  

*Note that .env files do not have a filename before the extension.*

You can either copy the contents of the `.env.example` file into your `.env` file (and fill it in) or you can configure the file by copying the blank template below (and fill it in):

```DB_HOST=
  DB_USER=
  DB_TABLE=
  DATABASE_URL=
  SERVER_IP=
```

## Create Your PostgreSQL Database Tables
To configure your initial database state, run the following at the command prompt:
* `./scripts/migrate.sh 2`

## Installing

* `npm install`
* `./scripts/make_certs.sh`

### Ports needed to be forwarded

* 80
* 443
* 43300
* 8226
* 8228
* 7003

### Permission to bind to low ports

`sudo setcap cap_net_bind_service=+ep $(which node)`

### Running

* `npm start`
