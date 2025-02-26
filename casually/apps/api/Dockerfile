# ==== BUILD IMAGE
FROM node:20 AS build-env

# Copy All
COPY ./. /src

# set the workdir
WORKDIR /src

RUN ls -all

RUN apt-get update && apt-get upgrade -y

# install whole stuff
RUN npm install
RUN npm run build:libs:all
RUN npm run build:apps:api

# ==== RUNTIME IMAGE
FROM node:20 AS runtime  

RUN apt-get update && apt-get upgrade -y

COPY --from=build-env src/dist/apps/api src/

COPY --from=build-env src/node_modules src/node_modules

WORKDIR /src
CMD ["node", "-r", "dotenv/config", "main.js", "--insecure-http-parser"]

EXPOSE 4000
