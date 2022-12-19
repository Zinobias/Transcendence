FROM node:latest
ENV NODE_ENV=PRODUCTION

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
RUN npm install
COPY . .
CMD ["npm", "run", "start:prod"]