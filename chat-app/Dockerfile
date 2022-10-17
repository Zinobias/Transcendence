FROM node:latest

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
RUN npm install
COPY [".", "./"]
CMD ["npm", "start"]