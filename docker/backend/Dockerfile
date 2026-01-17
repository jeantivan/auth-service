# STAGE: 1: Build
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependencies archives
COPY package*.json ./

# Install dependencies
RUN npm install

FROM base AS dev

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

# STAGE 2: Production
FROM base AS build

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Optional: We left only prod dependencies
RUN npm prune --production

FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start"]

