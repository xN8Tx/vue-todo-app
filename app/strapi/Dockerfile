# Stage 1: Install dependencies and build
FROM node:18-alpine AS builder
WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD ["yarn", "start"]

