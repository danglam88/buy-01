# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16-alpine as build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY .npmrc /root/
RUN npm config list
RUN npm install --ignore-scripts

# Copy the codebase into the image
COPY src src
COPY nginx.conf ./
COPY sonar-project.properties ./
COPY *.json ./

# Generate the build of the application using npx to call local ng
RUN npx ng build

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:alpine

# Install curl for health checking
RUN apk --no-cache add curl

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/buy-01 /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/assets/cert
RUN chmod -R 755 /usr/share/nginx/html && chown -R nginx:nginx /usr/share/nginx/html

# Copy the SSL certificate and key
COPY src/assets/cert/164.92.252.125.pem /etc/nginx
COPY src/assets/cert/164.92.252.125-key.pem /etc/nginx
RUN chmod 600 /etc/nginx/164.92.252.125-key.pem
RUN chmod 644 /etc/nginx/164.92.252.125.pem
RUN chown -R nginx:nginx /etc/nginx/164.92.252.125.pem /etc/nginx/164.92.252.125-key.pem

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the modified Nginx configuration
COPY nginx.conf /etc/nginx/conf.d

# Expose SSL port
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Health check to verify nginx is serving content
HEALTHCHECK --interval=1m --timeout=10s --retries=3 --start-period=30s \
  CMD curl -k -f https://localhost:443 || exit 1
