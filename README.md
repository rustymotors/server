MCO-Server
============

[![CircleCI](https://circleci.com/gh/drazisil/mco-server.svg?style=svg&circle-token=6937e163b7a7a8aed2cd5d4c50bed9501060457d)](https://circleci.com/gh/drazisil/mco-server)

## About

This is a game server, being written from scratch, for a very old and long dead game. The owners of said game have shown no interest in bringing it back, but even so all names of their IP have been avoided to prevent issues.

## Help Wanted

I'm writing this from scratch. While I'm proud of what I've done, I'm hitting the point where I need help. Therefore, I'm open-sourcing this. Any assistance you can provide, either from code help, to suggestions, to even pointing out better ways to do things are greatly appriciated.

## Server Setup

### Ports needed to be forwarded

* 43300
* 8226
* 8228
* 7003

## Generate SSL cert and key

```
./scripts/make_certs.sh
```

## Client Setup

Copy the pub.key file from the server to the client game directory

### Add the cert to Windows

http://stackoverflow.com/a/2955546/335583

### Delete the movies

<game dir>\Data\Movies



### Started

Mar 6, 2016
