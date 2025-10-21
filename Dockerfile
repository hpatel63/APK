# Multi-stage build for Aurora POS
FROM node:18-alpine AS base
WORKDIR /app

# Install server dependencies
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --production

# Install client dependencies and build
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install && npm run build

# Copy source
COPY server ./server
COPY client/dist ./client/dist

# Final runtime image
FROM node:18-alpine
WORKDIR /app
COPY --from=base /app/server /app/server
COPY --from=base /app/client/dist /app/client/dist
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app/server
EXPOSE 4000
CMD ["node", "src/server.js"]
