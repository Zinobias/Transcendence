# syntax=docker/dockerfile:1
FROM node:latest
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["./package.json", "./package-lock.json*", "./"]
RUN npm install -g @nestjs/cli
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]