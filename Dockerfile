# Use a more focused base image
FROM node:20-slim as builder

WORKDIR /workspace

# Combine update, install and cleanup to reduce layer size and ensure all actions are in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm set progress=false && \
    npm config set depth 0

COPY package.json package-lock.json ./
RUN npm ci

# Using node slim again to ensure only necessary packages are installed
FROM node:20-slim
WORKDIR /workspace

# Only install necessary runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    fc-cache -fv

# Copy only necessary files
COPY --from=builder /workspace/node_modules node_modules/
COPY ./ecosystem.config.js .
COPY ./package.json .
COPY ./src src/

EXPOSE 3000

CMD ["npm", "run", "run-prod"]
