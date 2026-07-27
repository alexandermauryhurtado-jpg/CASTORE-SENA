# ─── Stage base: dependencias comunes ─────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ─── Stage desarrollo: hot-reload con ts-node-dev ──────────────────────────────
FROM base AS development
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ─── Stage builder: compila TypeScript a JavaScript ───────────────────────────
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage producción: imagen mínima, solo JS compilado ───────────────────────
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# Copiar solo lo necesario para producción
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4000
CMD ["npm", "run", "start"]
