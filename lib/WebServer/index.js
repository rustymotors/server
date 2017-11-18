const async = require("async");
const web = require("./web.js");
const patchServer = require("./patchServer.js");
const logger = require("../../src/logger.js");

function start(callback) {
  /* Start the NPS servers */

  async.series(
    {
      patchServer: function(callback) {
        patchServer.start(err => {
          if (err) {
            console.error(err.message);
            console.error(err.stack);
            process.exit(1);
          }
          callback(null);
        });
      },
      web: function(callback) {
        web.start(err => {
          if (err) {
            console.error(err.message);
            console.error(err.stack);
            process.exit(1);
          }
          callback(null);
        });
      },
    },
    function(err, results) {
      logger.info("Patch Server started");
      logger.info("Web Server started");
      callback();
    }
  );
}

module.exports = { start };
