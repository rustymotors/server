const yaml = require('js-yaml');
const fs = require('fs');
const { Web } = require("../lib/WebServer");
const mcServer = require("./MCServer");

// Get document, or throw exception on error
try {
    const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
    const web = new Web();

    web.start(config);

    mcServer.run(config);
} catch (e) {
    console.log(e);
}

