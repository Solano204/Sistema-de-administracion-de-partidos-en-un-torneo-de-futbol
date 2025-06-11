FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the built application
COPY ./.next/standalone ./

# Copy public folder (this exists)
COPY ./public ./public

# Copy static files only if they exist
# First, let's create the directory structure
RUN mkdir -p .next

# Copy static files if they exist (this step might fail, but we'll handle it)
COPY ./.next/static ./.next/static 2>/dev/null || echo "No static files found"

# Alternative: Copy from standalone build instead
RUN if [ -d "./.next/static" ]; then echo "Static files found in standalone"; else echo "No static files in standalone build"; fi

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]



# npm run build:emergency docker build -f Dockerfile.working -t fut-next .
