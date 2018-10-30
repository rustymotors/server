# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

* Linux
** If you want to try running on Windows it may work, but I'm not going to support it
* Docker (optional, but only if you want to run Postgres manually)
* NodeJS 8

## Configure Environment Variables

Create a .env file at the root of your repository that maps to the appropriate locations.  

*Note that .env files do not have a filename before the extension.*

```DB_HOST=
  DB_USER=
  DB_TABLE=
  DATABASE_URL=
  POSTGRES_DB=
  POSTGRES_HOST=
  POSTGRES_USER=
  SERVER_IP=
```

## Create Your PostgreSQL Database Tables

Execute `/migrations/1-2.sql` to setup your database tables on the server.


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
