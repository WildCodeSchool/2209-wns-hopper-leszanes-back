FROM node:lts-alpine

WORKDIR /api

COPY package*.json ./
COPY tsconfig.json ./
COPY pnpm-lock.yaml ./
COPY src src
COPY tests ./
COPY jest.config.js ./
# COPY uploads uploads

RUN --mount=type=secret,id=env,target=/api/.env
RUN npm install -g pnpm
RUN pnpm install
