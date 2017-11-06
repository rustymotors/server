FROM node:8.9.0

COPY package.json .

RUN npm install

COPY src ./src
COPY lib ./lib
COPY scripts ./scripts
COPY data ./data
COPY config ./config

COPY server.js .

