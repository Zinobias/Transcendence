FROM node:latest

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
EXPOSE 8080
CMD ["node", "app.js"]