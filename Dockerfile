FROM node:20-alpine

WORKDIR /app

# ---------- Frontend ----------
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Backend ----------
WORKDIR /app/backend
RUN npm install

ENV NODE_ENV=production
EXPOSE 10000

CMD ["node", "src/index.js"]
