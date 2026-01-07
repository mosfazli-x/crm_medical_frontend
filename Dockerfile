FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV NUXT_PORT=3000
ENV NUXT_HOST=0.0.0.0

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
