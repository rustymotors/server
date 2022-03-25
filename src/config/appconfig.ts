export interface AppConfiguration {
  MCOS: {
    CERTIFICATE: {
      PRIVATE_KEY_FILE: string;
      PUBLIC_KEY_FILE: string;
      CERTIFICATE_FILE: string;
    };

    SETTINGS: {
      HTTP_LISTEN_HOST: string;
      HTTP_EXTERNAL_HOST: string;
      SSL_LISTEN_HOST: string;
      SSL_EXTERNAL_HOST: string;
      SHARD_LISTEN_HOST: string;
      SHARD_EXTERNAL_HOST: string;
      AUTH_LISTEN_HOST: string;
      AUTH_EXTERNAL_HOST: string;
      PATCH_LISTEN_HOST: string;
      PATCH_EXTERNAL_HOST: string;
      LISTEN_IP: string;
      AUTH_IP: string;
      DATABASE_CONNECTION_URI: string;
      LOG_LEVEL: string;
    };
  };
}

export const APP_CONFIG: AppConfiguration = {
  MCOS: {
    CERTIFICATE: {
      PRIVATE_KEY_FILE: "data/private_key.pem",
      PUBLIC_KEY_FILE: "data/pub.key",
      CERTIFICATE_FILE: "data/mcouniverse.crt",
    },

    SETTINGS: {
      HTTP_LISTEN_HOST: "localhost",
      HTTP_EXTERNAL_HOST: "localhost",
      SSL_LISTEN_HOST: "localhost",
      SSL_EXTERNAL_HOST: "localhost",
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
