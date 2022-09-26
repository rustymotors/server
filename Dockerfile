FROM node:18.9.1@sha256:48c6c0054de0a80275f9ff67010ab7b555848e126bc35893bba8a77bf871550a

WORKDIR /home/node/app

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl https://get.volta.sh | bash

RUN ~/.volta/bin/volta install node@18

COPY package*.json ./

RUN ~/.volta/bin/volta run npm ci --ignore-scripts && npx prisma generate
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

CMD [ "make", "docker-init" ]
