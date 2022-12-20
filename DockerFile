FROM node:lts-alpine

WORKDIR /api

COPY package*.json ./
COPY tsconfig.json ./
COPY pnpm-lock.yaml ./
COPY src src
COPY .env ./
# COPY uploads uploads

RUN npm install -g pnpm
RUN pnpm install