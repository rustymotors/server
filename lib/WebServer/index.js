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
            throw err;
          }
          callback(null);
        });
      },
      web: function(callback) {
        web.start(err => {
          if (err) {
            throw err;
          }
          callback(null);
        });
      },
    },
    function(err, results) {
      logger.info("AuthLogin Server started");
      callback();
    }
  );
}

module.exports = { start };
