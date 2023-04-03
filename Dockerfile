
FROM openjdk:19 AS server-base

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /app

# Copy the pom.xml file to the container
COPY server/pom.xml .

# Download the Maven dependencies
RUN mvn dependency:go-offline

# Copy the server code to the container
COPY server/src/ ./src/

# Build the server
RUN mvn package

# Final image for the server
FROM openjdk:11-jre-slim AS server

# Set the working directory to /app
WORKDIR /app

# Copy the built server to the container
COPY --from=server-base /app/target/server.jar .

# Set the entrypoint to run the server
CMD ["java", "-jar", "server.jar"]