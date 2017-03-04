function patchUpdateInfo() {
  const res = {
    headers: '\'Content-Type\', \'application/octet-stream\'',
    body: new Buffer('cafebeef00000000000003', 'hex'),
  }
  return res
}

function patchNPS() {
  const res = {
    headers: '\'Content-Type\', \'application/octet-stream\'',
    body: new Buffer('cafebeef00000000000003', 'hex'),
  }
  return res
}

function patchMCO() {
  const res = {
    headers: '\'Content-Type\', \'application/octet-stream\'',
    body: new Buffer('cafebeef00000000000003', 'hex'),
  }
  return res
}

module.exports = {
  patchMCO,
  patchNPS,
  patchUpdateInfo,
}
