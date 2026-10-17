FROM node:24.18.1
WORKDIR /app

RUN npm install --global tsx

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npx", "tsx", "src/nps_server.ts"]
