#!/usr/bin/env node

import { RoutingServer } from 'router'
import { PatchServer } from 'patch'
import { AuthLogin } from 'auth'
import { ShardServer } from 'shard'
import { HTTPProxyServer } from 'proxy'

RoutingServer.getInstance().start()
PatchServer.getInstance().start()
AuthLogin.getInstance().start()
ShardServer.getInstance().start()

HTTPProxyServer.getInstance().start()
