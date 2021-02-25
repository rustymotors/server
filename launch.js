#!/usr/bin/env node

const { spawn } = require('child_process')

spawn('node', ['--require', 'ts-node/register', 'app.ts'], { stdio: 'inherit' })
