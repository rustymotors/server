# MCO-Server

[![CircleCI](https://circleci.com/gh/drazisil/mco-server.svg?style=shield)](https://circleci.com/gh/drazisil/mco-server)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) 
[![NSP Status](https://nodesecurity.io/orgs/drazisil/projects/f5724640-0c3f-4c14-a32d-821760fc186d/badge)](https://nodesecurity.io/orgs/drazisil/projects/f5724640-0c3f-4c14-a32d-821760fc186d)
[![Greenkeeper badge](https://badges.greenkeeper.io/drazisil/mco-server.svg)](https://greenkeeper.io/)

## About Fish!

This is a game server, being written from scratch, for a very old and long dead game. The owners of said game have shown no interest in bringing it back, but even so all names of their IP have been avoided to prevent issues.

## Help Wanted

I'm writing this from scratch. While I'm proud of what I've done, I'm hitting the point where I need help. Therefore, I'm open-sourcing this. Any assistance you can provide, either from code help, to suggestions, to even pointing out better ways to do things are greatly appreciated.

## Server Setup

### Ports needed to be forwarded

* 43300
* 8226
* 8228
* 7003

### Generate SSL cert and key

```bash
./scripts/make_certs.sh
```

## Client Setup

Copy the pub.key file from the server to the client game directory

### Add the cert to Windows

<http://stackoverflow.com/a/2955546/335583>

### Delete the movies

`<game dir>\Data\Movies`

## Started

Mar 6, 2016

## Current Status

* Client clears patch and update server (port 80)
* Client clears the login web server (port 443)
* Client clears the login server (port 8226)
* Client clears the persona server (port 8228)
* Client clears the lobby/room server (port 7003) and decrypts the NPS packets sent after
* Client passes client connect to MCOTS (port 43300) but does not decrypt the following packets (yet)
