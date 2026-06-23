FROM node:25

WORKDIR /app

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npx", "tsx", "--import", "./src/instrument.mjs", "src/nps_server.ts"]
