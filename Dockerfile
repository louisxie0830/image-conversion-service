FROM node:20 as builder

WORKDIR /workspace

RUN apt-get update && \
    apt-get install -y --no-install-recommends git python3 make build-essential libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm set progress=false && \
    npm config set depth 0

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20
WORKDIR /workspace
COPY --from=builder /workspace/node_modules node_modules/
COPY ./ecosystem.config.js .
COPY ./package.json .
COPY ./src src/

EXPOSE 3000 3000

CMD ["npm","run","run-prod"]