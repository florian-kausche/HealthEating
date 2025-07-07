# Stage 1: Build stage (if you had a build step, e.g., TypeScript)
# For a simple Node.js app without a separate build step for JS, this might be simpler.
# If using TypeScript, you'd have a build stage here to compile TS to JS.

# Stage 2: Production stage
# Use an official Node.js runtime as a parent image
# Choose a version that matches your development environment (e.g., LTS version)
FROM node:18-alpine AS production

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Using --only=production to install only production dependencies
# If you have devDependencies needed for any reason post-build, adjust this.
RUN npm install --only=production --ignore-scripts

# Bundle app source
COPY . .

# Ensure .env file is NOT copied into the image. Configuration should be passed via environment variables at runtime.
# If you have a .env.production.template or similar, you could copy that for reference, but not a live .env.

# Expose the port the app runs on (should match PORT in .env or default in app.js)
EXPOSE 3001
# Note: If process.env.PORT is used in app.js, Cloud Run and other platforms will set this.
# The EXPOSE instruction is documentation for humans and for some tools, but doesn't publish the port itself.

# Define the command to run the application
# Using an array makes it the preferred exec form.
# PM2 could be used here for better process management in production if not using a PaaS that handles it.
# For simple cases or PaaS that manage processes (like Cloud Run, Beanstalk), node app.js is often fine.
CMD [ "node", "src/app.js" ]
