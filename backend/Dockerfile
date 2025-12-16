FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
