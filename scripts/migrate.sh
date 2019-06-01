#!/usr/bin/env bash

if [ -z "$POSTGRES_DB" ]; then
    echo "Please set the env: POSTGRES_DB"
    exit
fi

if [ -z "$POSTGRES_USER" ]; then
    echo "Please set the env: POSTGRES_USER"
    exit
fi

if [ -z "$POSTGRES_HOST" ]; then
    echo "Please set the env: POSTGRES_HOST"
    exit
fi

# postgres://mco@127.0.0.1/mco

npx pg-migrator postgres://"$POSTGRES_USER"@"$POSTGRES_HOST"/"$POSTGRES_DB" "$1"