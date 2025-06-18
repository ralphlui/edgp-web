# Stage 1: Build the application
FROM node:22-alpine as builder

# Set the working directory in the builder stage
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the builder container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the builder container
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the application
FROM nginx:stable-alpine as runner

# Set the working directory in the runner stage
WORKDIR /app

# Copy build output to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.d /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
