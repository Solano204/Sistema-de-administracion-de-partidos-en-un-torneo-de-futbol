# This packages an ALREADY-BUILT Next.js app - it does not run `npm run
# build` itself. Run one of package.json's build scripts first (`npm run
# build`, or `build:memory`/`build:windows`/`build:emergency` if you hit the
# documented next-build memory problem - see next.config.js's comments and
# `npm run analyze` for diagnosing it), THEN `docker build .`. This mirrors
# what .github/workflows/docker-build.yml does: build on the runner/host
# directly (where you control available RAM), and let this Dockerfile just
# containerize the output - building inside the Docker build added overhead
# on top of a build that was already memory-constrained.
FROM node:25-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY ./.next/standalone ./
COPY ./public ./public
COPY ./.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
