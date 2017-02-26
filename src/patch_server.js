function patchUpdateInfo (req) {
  const res = {
    'headers': "'Content-Type', 'application/octet-stream'",
    'body': new Buffer('cafebeef00000000000003', 'hex')
  }
  return res
}

function patchNPS (req) {
  const res = {
    'headers': "'Content-Type', 'application/octet-stream'",
    'body': new Buffer('cafebeef00000000000003', 'hex')
  }
  return res
}

function patchMCO (req) {
  const res = {
    'headers': "'Content-Type', 'application/octet-stream'",
    'body': new Buffer('cafebeef00000000000003', 'hex')
  }
  return res
}

module.exports = {
  patchMCO,
  patchNPS,
  patchUpdateInfo
}
