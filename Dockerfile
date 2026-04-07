FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/src ./src

EXPOSE 5000

USER node

CMD ["node", "src/server.js"]