# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17 as builder

# Set the working directory in the container
WORKDIR /app

# Copy only pom.xml initially to leverage Docker cache
COPY pom.xml ./
COPY media/pom.xml media/pom.xml

# Download dependencies - cached unless pom.xml changes
RUN mvn -f ./media/pom.xml dependency:go-offline

# Copy the source code and build the application
COPY media/src media/src

# Copy the certificate into the docker image
COPY media/src/main/resources/*.pem /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.p12 /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.crt /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.jks /usr/local/share/ca-certificates/

# Import the certificate into the java truststore
RUN keytool -import -trustcacerts -noprompt -storepass changeit -alias mycert -file /usr/local/share/ca-certificates/media.crt -keystore ${JAVA_HOME}/lib/security/cacerts

# Build the application without running tests
RUN mvn -f ./media/pom.xml clean package -DskipTests

# Stage 2: Create the final image
FROM openjdk:17-slim

# Accept build arguments
ARG MEDIA_DB_CREDENTIALS_USERNAME
ARG MEDIA_DB_CREDENTIALS_PASSWORD
ARG JWT_SECRET

# Set arguments as environment variables for runtime
ENV MEDIA_DB_CREDENTIALS_USERNAME=${MEDIA_DB_CREDENTIALS_USERNAME}
ENV MEDIA_DB_CREDENTIALS_PASSWORD=${MEDIA_DB_CREDENTIALS_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}

WORKDIR /app

# Install curl for health checking and cleanup in one layer
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy only the built artifact from the builder stage
COPY --from=builder /app/media/target/media.jar ./

# Specify the startup command
CMD ["java", "-jar", "media.jar"]

# Health check using Spring Boot Actuator
HEALTHCHECK --interval=1m --timeout=10s --retries=3 --start-period=30s \
  CMD curl -k -f https://localhost:8445/actuator/health || exit 1
