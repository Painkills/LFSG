# Use a Node.js runtime as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the client files to the container
COPY /client /app

# Install the dependencies for the client
RUN npm install

# Expose port 3000 for the client
EXPOSE 3000

# Run the client when the container starts
CMD ["npm", "start"]