# syntax=docker/dockerfile:1
FROM node:latest
ENV NODE_ENV=development
# SET ENV TO PRODUCTION WHEN DONE
WORKDIR /usr/src/app

# Metadata for npm
#package.json is a versoning file used to install multiple packages in your project.
# package.json.lock is generated by npm init, fro mthe package .json
# Link : https://www.geeksforgeeks.org/difference-between-package-json-and-package-lock-json-files/

# COPY ["./package.json", "./package-lock.json*", "./"]

# # npm install will download all dependencies defined in package.json
# # into node_modules
# RUN npm install

# # Installed all dependencies, now we copy over the sourcecode
# COPY . .
EXPOSE 8081 8082 8084
CMD ["npm", "run", "start:dev"]