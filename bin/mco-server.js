#!/usr/bin/env node

import { RoutingServer } from 'router'
import { PatchServer } from 'patch'
import { AuthLogin } from 'auth'
import { ShardServer } from 'shard'
import { HTTPProxyServer } from 'proxy'
import { MCServer } from 'core'
import { AdminServer } from 'admin'

RoutingServer.getInstance().start()
PatchServer.getInstance().start()
AuthLogin.getInstance().start()
ShardServer.getInstance().start()

HTTPProxyServer.getInstance().start()

const core = MCServer.getInstance()
core.startServers()

AdminServer.getInstance(core).start()
