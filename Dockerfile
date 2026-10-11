# Multi-Stage Production Container for TERRA 3D Environmental Digital Twin
# Compatible with Finch, Docker, AWS App Runner, ECS Fargate, and EKS

# Stage 1: Build the Vite Frontend & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV AWS_REGION=us-east-1

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/aws ./src/aws
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose internal HTTP port
EXPOSE 3000

# Run with tsx (or node dist/server.js)
CMD ["npx", "tsx", "server.ts"]
