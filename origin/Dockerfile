FROM node:18.14-alpine3.17 as base

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

RUN addgroup -S -g 1001 nodejs && adduser -u 1001 -G nodejs -D nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

RUN mkdir prisma
COPY ./prisma/schema.prisma ./prisma
RUN npx prisma generate

# Rebuild the source code only when needed
FROM deps AS builder

COPY --chown=nextjs:nodejs . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

ENV NODE_ENV production
RUN ls -la /app && whoami
RUN npm run build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM builder AS runner

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "run", "sart"]
