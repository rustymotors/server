#!/bin/sh
openssl req -x509 -config mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/cert.pem -days 365
openssl rsa -in ./data/private_key.pem -outform DER -pubout -out ./data/pub.key
