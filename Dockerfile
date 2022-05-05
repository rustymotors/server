FROM node:18

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 80
EXPOSE 6660
EXPOSE 8228
EXPOSE 8226
EXPOSE 7003
EXPOSE 8227
EXPOSE 43200
EXPOSE 43300
EXPOSE 43400
EXPOSE 53303

CMD [ "npm", "run", "start:docker" ]
