FROM node:8.11

WORKDIR /app

COPY package.json ./
RUN npm install --quiet

COPY . .