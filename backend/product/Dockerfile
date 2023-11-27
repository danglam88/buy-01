# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17 as builder

# Set the working directory in the container
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml ./
COPY product/pom.xml product/pom.xml
COPY product/src product/src

# Copy the certificate into the docker image
COPY product/src/main/resources/*.pem /usr/local/share/ca-certificates/
COPY product/src/main/resources/*.p12 /usr/local/share/ca-certificates/
COPY product/src/main/resources/*.crt /usr/local/share/ca-certificates/
COPY product/src/main/resources/*.jks /usr/local/share/ca-certificates/

# Import the certificate into the java truststore
RUN keytool -import -trustcacerts -noprompt -storepass changeit -alias mycert -file /usr/local/share/ca-certificates/product.crt -keystore ${JAVA_HOME}/lib/security/cacerts

# Build the application without running tests
RUN mvn -f ./product/pom.xml clean package -DskipTests

# Stage 2: Create the final image
FROM openjdk:17-slim

# Accept build arguments
ARG PRODUCT_DB_CREDENTIALS_USERNAME
ARG PRODUCT_DB_CREDENTIALS_PASSWORD
ARG JWT_SECRET

# Set arguments as environment variables for runtime
ENV PRODUCT_DB_CREDENTIALS_USERNAME=${PRODUCT_DB_CREDENTIALS_USERNAME}
ENV PRODUCT_DB_CREDENTIALS_PASSWORD=${PRODUCT_DB_CREDENTIALS_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}

WORKDIR /app

# Install curl for health checking
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only the built artifact from the builder stage
COPY --from=builder /app/product/target/product.jar ./

# Specify the startup command
CMD ["java", "-jar", "product.jar"]

# Health check using Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -k -f https://localhost:8444/actuator/health || exit 1
