MCO-Server
============

[![CircleCI](https://circleci.com/gh/drazisil/mco-server.svg?style=svg&circle-token=6937e163b7a7a8aed2cd5d4c50bed9501060457d)](https://circleci.com/gh/drazisil/mco-server)

## Ports needed to be forwarded

* 43300
* 8226
# 8228
* 7003

```
openssl req -x509 -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/cert.pem -days 365
openssl rsa -in ./data/private_key.pem -outform DER -pubout -out ./data/pub.key
```

Copy the pub.key file to the MotorCity game directory

### Add the following entry to your etc/hosts file

```
127.0.0.1       dev.mco
```

### Add the cert to Windows

http://stackoverflow.com/a/2955546/335583

### Delete the movies

C:\Motor City Online\Data\Movies

#### Started

Mar 6, 2016
