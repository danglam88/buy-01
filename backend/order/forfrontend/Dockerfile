# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17 as builder

# Set the working directory in the container
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml ./
COPY order/pom.xml order/pom.xml
COPY order/src order/src

# Copy the certificate into the docker image
COPY order/src/main/resources/*.pem /usr/local/share/ca-certificates/
COPY order/src/main/resources/*.p12 /usr/local/share/ca-certificates/
COPY order/src/main/resources/*.crt /usr/local/share/ca-certificates/
COPY order/src/main/resources/*.jks /usr/local/share/ca-certificates/

# Import the certificate into the java truststore
RUN keytool -import -trustcacerts -noprompt -storepass changeit -alias mycert -file /usr/local/share/ca-certificates/order.crt -keystore ${JAVA_HOME}/lib/security/cacerts

# Build the application without running tests
RUN mvn -f ./order/pom.xml clean package -DskipTests

# Stage 2: Create the final image
FROM openjdk:17-slim

WORKDIR /app

# Install curl for health checking
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only the built artifact from the builder stage
COPY --from=builder /app/order/target/order.jar ./

# Specify the startup command
CMD ["java", "-jar", "order.jar"]

# Health check using Spring Boot Actuator
HEALTHCHECK --interval=1m --timeout=10s --retries=3 --start-period=30s \
  CMD curl -f http://localhost:8083/actuator/health || exit 1
