const { CastanetResponse, PatchServer } = require('../../../src/services/PatchAndShard/patchServer')
const tap = require('tap')

tap.test('PatchServer', (t) => {
  const patchServer = new PatchServer()

  t.equals(CastanetResponse.body.toString('hex'), 'cafebeef00000000000003')
  t.equals(patchServer._patchUpdateInfo().body.toString('hex'), 'cafebeef00000000000003')
  t.equals(patchServer._patchNPS().body.toString('hex'), 'cafebeef00000000000003')
  t.equals(patchServer._patchMCO().body.toString('hex'), 'cafebeef00000000000003')
  t.contains(patchServer._generateShardList(), 'The Clocktower')
  t.deepEquals(patchServer._getBans(), [])
  t.done()
})
