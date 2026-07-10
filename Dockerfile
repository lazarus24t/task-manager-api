FROM node:slim
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "server.js"]
