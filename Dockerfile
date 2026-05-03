# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY --from=build /app/package*.json ./
COPY --from=build /app/data_schema.json ./

RUN npm install --production

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
