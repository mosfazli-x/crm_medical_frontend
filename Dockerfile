FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN rm -f package-lock.json

RUN npm config set registry https://package-mirror.liara.ir/repository/npm/ --global

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]