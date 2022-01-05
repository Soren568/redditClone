FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Docker will cache each layer/command - below are basically the cache keys
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . .
COPY .env.production .env

# need to copy files before we compile
RUN yarn build

# set env to production - may be done for us by dokku but good to have it on to be sure
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
ENV NODE_ENV production

# Shouldnt matter what port with dokku
EXPOSE 8080
CMD [ "node", "dist/index.js" ]
# Logs in users as non root users
USER node