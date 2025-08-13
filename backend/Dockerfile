# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY . .

# Build TypeScript to JavaScript (make sure you have a build script)
RUN npm run build

# Expose backend port (adjust to your app port)
EXPOSE 5000

# Start backend server from compiled code
CMD ["node", "dist/server.js"]
