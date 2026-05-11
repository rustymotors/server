FROM node:24

WORKDIR /app

COPY . .
RUN npm install

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npx", "tsx", "--import", "./src/instrument.mjs", "src/nps_server.ts"]
