# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16-alpine as build

# Set the working directory
WORKDIR /app

# Copy the codebase into the image
COPY . .

# Remove the existing node_modules and dist folders
RUN rm -rf node_modules dist

# Clean the npm cache
RUN npm cache clean --force

# Install all the dependencies
RUN npm install

# Generate the build of the application using npx to call local ng
RUN npx ng build

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:alpine
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

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

# Run nginx as non-root user
USER nonroot

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
