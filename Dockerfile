FROM node:10 as builder
WORKDIR /workspace
RUN apt-get update && apt-get install -y git python make build-essential
RUN npm install -g node-pre-gyp node-gyp
COPY package.json package-lock.json ./
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

FROM node:10

# Bundle APP files
WORKDIR /workspace
RUN apt-get update && apt-get install -y gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libio-compress-perl libfreetype6 ttf-dejavu ttf-wqy-zenhei fontconfig && fc-cache -fv
COPY ./exiftool/exiftool /usr/bin
RUN chmod a+x /usr/bin/exiftool
COPY ./exiftool/lib /usr/bin/lib
COPY --from=builder /workspace/node_modules node_modules/
COPY ./ecosystem.config.js .
COPY ./package.json .
COPY ./src src/
COPY ./fonts fonts/
COPY ./static static/
COPY ./templates ./templates/
COPY .ExifTool_config /root/.ExifTool_config
EXPOSE 8080 9090

CMD ["npm","run","prod"]
