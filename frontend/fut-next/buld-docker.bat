# Step 1: Navigate to your project directory
# Make sure you're in the correct directory
cd C:\Users\GAMER\Documents\FUTNEXT\Fut-Next\Fut-Next\fut-next\fut-next

# Step 2: Set increased memory limit for Node.js
# For Windows Command Prompt:
set NODE_OPTIONS=--max-old-space-size=8192

# Step 3: Build your Next.js app WITHOUT linting
# Note: Make sure to use two separate dashes before no-lint
npm run build -- --no-lint

# Step 4: Create Dockerfile.prebuild in your project directory
# See content below

# Step 5: Build Docker image from pre-built app
docker build -f Dockerfile.prebuild -t fut-next-app .

# Step 6: Run the container
docker run -p 3000:3000 fut-next-app