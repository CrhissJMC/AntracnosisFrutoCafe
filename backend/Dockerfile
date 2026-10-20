# API Node.js + Express
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Dependencias primero (aprovecha la caché de capas de Docker)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY src ./src

# No ejecutar como root
USER node

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=6 \
  CMD wget -qO- http://127.0.0.1:4000/api/health > /dev/null || exit 1

CMD ["node", "src/server.js"]
