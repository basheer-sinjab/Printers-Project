FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output

RUN mkdir -p /app/data /app/uploads/printers

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]