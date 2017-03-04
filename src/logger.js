const logger = require('winston')

logger.cli()
// logger.add(logger.transports.File, { filename: 'logs/mco_server.log' })
logger.add(require('winston-daily-rotate-file'), {
  filename: 'logs/mco-server_log.json',
  json: true,
  prepend: true,
  datePattern: 'yyyy-MM-dd_',
})

module.exports = logger
