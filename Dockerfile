FROM node:23-bookworm AS base

WORKDIR /workspace

FROM base AS development

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5000

FROM base AS production

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

USER node

EXPOSE 5000

CMD ["npm", "start"]
