FROM node:8.11

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY . .
