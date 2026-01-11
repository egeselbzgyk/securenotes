FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --prefer-offline --no-audit
COPY prisma ./prisma
COPY prisma.config.ts ./

COPY . .

# Prisma client
RUN npx prisma generate

# TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
