FROM node:22-alpine 

# Copy All
COPY ./. /src

WORKDIR /src

RUN npm install
RUN npm audit
RUN npm run test
RUN npm run build

CMD ["npm", "run", "start"]

