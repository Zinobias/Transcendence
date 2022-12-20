FROM node:latest
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["./package.json", "./package-lock.json*", "./tsconfig.json", "./"]
RUN npm install
COPY [".", "./"]
CMD ["npm", "run", "start:prod"]