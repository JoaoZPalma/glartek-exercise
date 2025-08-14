# Build stage
FROM node:20.19.0 AS build

WORKDIR /usr/src/app

# Copy frontend package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build the React app for production
RUN npm run build

# Production stage - serve with nginx
FROM nginx:stable-alpine

# Copy build output to nginx html folder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
