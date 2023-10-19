# Use the official maven/Java 17 base image
FROM maven:3.8.3-openjdk-17

# Set the working directory in the container
WORKDIR /app

# Copy the parent pom.xml file
COPY pom.xml pom.xml

# Copy the current microservice folder
COPY media ./media

# Copy the certificate into the docker image
COPY media/src/main/resources/*.pem /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.p12 /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.crt /usr/local/share/ca-certificates/
COPY media/src/main/resources/*.jks /usr/local/share/ca-certificates/

# Import the certificate into the java truststore
RUN keytool -import -trustcacerts -noprompt -storepass changeit -alias mycert -file /usr/local/share/ca-certificates/media.crt -keystore ${JAVA_HOME}/lib/security/cacerts

# Download all required dependencies into one layer
RUN mvn -B -f ./media/pom.xml dependency:resolve-plugins dependency:resolve

# Build the application
RUN mvn -f ./media/pom.xml package -DskipTests

# Specify the startup command
CMD ["java", "-jar", "./media/target/media.jar"]
