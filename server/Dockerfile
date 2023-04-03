# Use an OpenJDK 19 runtime as the base image
FROM openjdk:19-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the server files to the container
COPY target/lfsg-0.0.1-SNAPSHOT.jar /app/server.jar

# Expose port 8082 for the server
EXPOSE 8082

# Run the server when the container starts
CMD ["java", "-jar", "server.jar"]