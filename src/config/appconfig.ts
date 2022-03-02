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
      HTTP_LISTEN_HOST: "0.0.0.0",
      HTTP_EXTERNAL_HOST: "10.10.5.20",
      SSL_LISTEN_HOST: "0.0.0.0",
      SSL_EXTERNAL_HOST: "10.10.5.20",
      SHARD_LISTEN_HOST: "0.0.0.0",
      SHARD_EXTERNAL_HOST: "10.10.5.20",
      AUTH_LISTEN_HOST: "0.0.0.0",
      AUTH_EXTERNAL_HOST: "10.10.5.20",
      PATCH_LISTEN_HOST: "0.0.0.0",
      PATCH_EXTERNAL_HOST: "10.10.5.20",
      DATABASE_CONNECTION_URI: "db.mco.db",
      LOG_LEVEL: "debug",
    },
  },
};
