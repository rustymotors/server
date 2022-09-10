FROM node:18.9.0@sha256:5f32c2889828b26e47e87aeae3b42662a72442f0fcf5b0af3b1417d226d4623a

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
