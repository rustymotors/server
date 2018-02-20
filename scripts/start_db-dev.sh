#!/usr/bin/env bash

if [ -z "$PGDATABASE" ]; then
    echo "Please set the env: PGDATABASE"
    exit
fi

if [ -z "$PGUSER" ]; then
    echo "Please set the env: PGUSER"
    exit
fi

if [ -z "$PGHOST" ]; then
    export PGHOST=localhost
fi

docker container ls | grep "$PGDATABASE"_db 1> /dev/null
container_exists=$?
if [ $container_exists -eq 0 ] 
then
  echo "Container exists"
  if [ "$1" == "prod" ]
  then
    docker start "$PGDATABASE"
  else
    docker start "$PGDATABASE"_dev
  fi
else
  echo "Container does not exist"
  mkdir "$(pwd)"/data/db
  chown "$(pwd)"/data/db postgres
  docker run --name "$PGDATABASE"_db -p 5432:5432 -v "$(pwd)"/data/db:/var/lib/postgresql/data -v "$(pwd)"/data/db:/var/run/postgresql/data -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" -d postgres:10
fi

if [ "$1" == "prod" ]
then
  createdb -U "$PGUSER" "$PGDATABASE"
else
  createdb -U "$PGUSER" "$PGDATABASE"_dev
fi