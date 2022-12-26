module.exports = {
    apps: [{
      name: "mcos",
      script: "./app.js",
      watch: ["packages/**/*.js", "app.js"],
      env: {
        NODE_ENV: "development",
        DEBUG: 'mcos',
        EXTERNAL_HOST: '10.10.5.20'
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }