export default {
  MCOS: {
    CERTIFICATE: {
      PRIVATE_KEY_FILE: "data/private_key.pem",
      PUBLIC_KEY_FILE: "data/pub.key",
      CERTIFICATE_FILE: "data/mcouniverse.crt",
    },

    SETTINGS: {
      SHARD_LISTEN_HOST: "localhost",
      SHARD_EXTERNAL_HOST: "localhost",
      AUTH_LISTEN_HOST: "localhost",
      AUTH_EXTERNAL_HOST: "localhost",
      PATCH_LISTEN_HOST: "localhost",
      PATCH_EXTERNAL_HOST: "localhost",
      LISTEN_IP: "localhost",
      AUTH_IP: "localhost",
      DATABASE_CONNECTION_URI: "db.mco.db",
      LOG_LEVEL: "debug",
    },
  },
};
