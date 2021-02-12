const request = require('supertest')
const { Response } = require('supertest')
const {
  CastanetResponse,
  PatchServer
} = require('../../../src/services/PatchAndShard/patchServer')
const tap = require('tap')
const depLogger = require('../../../src/shared/logger')
const sinon = require('sinon')

const fakeLogger = sinon.stub(depLogger.logger, 'info')

tap.test('PatchServer', t => {
  const patchServer = new PatchServer(depLogger.logger)

  t.equals(CastanetResponse.body.toString('hex'), 'cafebeef00000000000003')
  t.equals(
    patchServer._patchUpdateInfo().body.toString('hex'),
    'cafebeef00000000000003'
  )
  t.equals(
    patchServer._patchNPS().body.toString('hex'),
    'cafebeef00000000000003'
  )
  t.equals(
    patchServer._patchMCO().body.toString('hex'),
    'cafebeef00000000000003'
  )
  t.contains(patchServer._generateShardList(), 'The Clocktower')
  t.deepEquals(patchServer._getBans(), [])
  t.done()
})

tap.test('PatchServer - Shardlist', t => {
  const patchServer = new PatchServer(depLogger.logger)
  request(patchServer.serverPatch)
    .get('/ShardList/')
    .then(
      response => {
        t.contains(response.text, '[The Clocktower]')
        t.done()
      },
      e => {
        console.error(`Error: ${e}`)
      }
    )
})

tap.test('PatchServer - UpdateInfo', t => {
  const patchServer = new PatchServer(depLogger.logger)
  request(patchServer.serverPatch)
    .get('/games/EA_Seattle/MotorCity/UpdateInfo')
    .then(response => {
      t.deepEquals(response.body, CastanetResponse.body)
      t.done()
    })
    .catch(e => {
      console.error(e)
    })
})

tap.test('PatchServer - NPS', t => {
  const patchServer = new PatchServer(depLogger.logger)
  request(patchServer.serverPatch)
    .get('/games/EA_Seattle/MotorCity/NPS')
    .then(response => {
      t.deepEquals(response.body, CastanetResponse.body)
      t.done()
    })
    .catch(e => {
      console.error(e)
    })
})

tap.test('PatchServer - MCO', t => {
  const patchServer = new PatchServer(depLogger.logger)
  request(patchServer.serverPatch)
    .get('/games/EA_Seattle/MotorCity/MCO')
    .then(response => {
      t.deepEquals(response.body, CastanetResponse.body)
      t.done()
    })
    .catch(e => {
      console.error(e)
    })
})

tap.test('PatchServer - Default', t => {
  const patchServer = new PatchServer(depLogger.logger)

  t.deepEquals(patchServer._getBans(), [], 'initial _getBans()')

  // deepcode ignore PromiseNotCaughtNode/test: This promise doesn't return an error, it seems.
  request(patchServer.serverPatch)
    .get('/')
    .then(/** @type {Response} */  response => {
      t.deepEquals(patchServer._getBans(), [], '_getBans() after request')
      t.equals(response.status, 404, 'should return 404')
      t.done()
    })
  patchServer._addBan('1.1.1.1')
  t.deepEquals(
    patchServer._getBans(),
    ['1.1.1.1'],
    '_getBans() contains an entry after _addBan()'
  )
  patchServer._clearBans()
  t.deepEquals(
    patchServer._getBans(),
    [],
    '_getBans() is empty after _cleanBans()'
  )
})

tap.skip('PatchServer - Start/Stop', async t => {
  const patchServer = new PatchServer(depLogger.logger)

  const start = await patchServer.start()

  start.on('listening', () => {
    t.ok(true, 'server is listening')

    t.ok(
      patchServer.serverPatch.close(r => {
        t.deepEquals(r, null, 'server is stopped')
        t.done()
      }),
      'can stop'
    )
  })
})
