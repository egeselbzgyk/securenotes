FROM node:25-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Prisma client
RUN npx prisma generate

# TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
