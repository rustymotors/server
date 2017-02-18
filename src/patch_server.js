function patchUpdateInfo (req) {
  console.log(req.method)
  console.log(req.url)
  const res = {
    'headers': "'Content-Type', 'application/octet-stream'",
    'body': new Buffer('cafebeef00000000000003', 'hex')
  }
  return res
}

function patchNPS (req) {
  console.log(req.method)
  console.log(req.url)
  const res = {
    'headers': "'Content-Type', 'application/octet-stream'",
    'body': new Buffer('cafebeef00000000000003', 'hex')
  }
  return res
}

function patchMCO (req) {
  console.log(req.method)
  console.log(req.url)
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
