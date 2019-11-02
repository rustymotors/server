FROM node:10.16.0-jessie

RUN setcap cap_net_bind_service=+ep $(which node)

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY tsconfig.json tsconfig.json

COPY src src

COPY data data

COPY config.json config.json

COPY typings typings

COPY migrations migrations
