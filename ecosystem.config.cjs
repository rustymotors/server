module.exports = {
    apps: [{
      name: "mcos",
      script: "./app.js",
      watch: ["packages/**/*.js", "app.js"],
      env: {
        NODE_ENV: "development",
        DEBUG: 'mcos*',
        EXTERNAL_HOST: '10.10.5.20',
        CONNECTION_URL: 'postgresql://postgres:password@localhost:5432/mcos',
        PRIVATE_KEY_FILE: 'data/private_key.pem',
        PUBLIC_KEY_FILE: 'data/pub.key',
        CERTIFICATE_FILE: 'data/mcouniverse.crt',
        NODE_OPTIONS: '--openssl-legacy-provider'
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }