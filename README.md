MCO-Server
============

[![CircleCI](https://circleci.com/gh/drazisil/mco-server.svg?style=svg&circle-token=6937e163b7a7a8aed2cd5d4c50bed9501060457d)](https://circleci.com/gh/drazisil/mco-server)

## Ports needed to be forwarded

* 43300
* 8226
# 8228
* 7003

```
openssl genrsa -out ./data/private_key.pem 1024
openssl rsa -in ./data/private_key.pem -pubout -out ./data/pub.key
```