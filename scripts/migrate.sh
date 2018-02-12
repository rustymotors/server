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

npx pg-migrator postgres://"$PGUSER"@"$PGHOST"/"$PGDATABASE" "$1"