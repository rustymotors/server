FROM node:16-slim
ENV NODE_ENV=production
WORKDIR /usr/src/app
# COPY ["package.json", "yarn.lock", "./bin", "./packages", "./.yarn", "./"]

# Find some way to copy the ./packages dir, including the dir itself.
COPY . .
RUN yarn install
RUN yarn workspaces foreach install
COPY ./ .
EXPOSE 80
EXPOSE 443
RUN chown -R node /usr/src/app
USER node
CMD ["yarn", "start"]
