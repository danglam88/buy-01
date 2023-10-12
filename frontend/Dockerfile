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

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/* /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
