FROM node:10.22.0-jessie

RUN setcap cap_net_bind_service=+ep $(which node)

COPY package.json package.json
COPY npm-shrinkwrap.json npm-shrinkwrap.json

RUN npm install

COPY src src

COPY migrations migrations
