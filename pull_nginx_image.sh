#!/usr/bin/env sh
wget https://archive.org/download/nginx_1.9.8.tar/nginx_1.9.8.tar.gz
gunzip nginx_1.9.8.tar.gz
docker load -i nginx_1.9.8.tar
