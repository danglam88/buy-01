# Use the official maven/Java 17 base image
FROM maven:3.8.3-openjdk-17

# Set the working directory in the container
WORKDIR /app

# Copy the parent pom.xml file
COPY pom.xml pom.xml

# Copy the current microservice folder
COPY user ./user

# Download all required dependencies into one layer
RUN mvn -B -f ./user/pom.xml dependency:resolve-plugins dependency:resolve

# Build the application
RUN mvn -f ./user/pom.xml package -DskipTests

# Specify the startup command
CMD ["java", "-jar", "./user/target/user.jar"]
