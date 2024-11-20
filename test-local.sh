#!/bin/bash

# Enable debugging
set -x

# Define variables
VERDACCIO_IMAGE="verdaccio/verdaccio"
VERDACCIO_CONTAINER_NAME="verdaccio"
VERDACCIO_PORT="4873"
REGISTRY_URL="http://localhost:${VERDACCIO_PORT}"
PACKAGE_NAME="your-package-name"

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker and try again."
    exit 1
fi

# Stop and remove any existing Verdaccio container
if [ "$(docker ps -q -f name=${VERDACCIO_CONTAINER_NAME})" ]; then
    echo "Stopping existing Verdaccio container..."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    echo "Removing existing Verdaccio container..."
    docker rm ${VERDACCIO_CONTAINER_NAME}
fi

# Start Verdaccio in Docker
echo "Starting Verdaccio..."
docker run -d --name ${VERDACCIO_CONTAINER_NAME} -p ${VERDACCIO_PORT}:${VERDACCIO_PORT} ${VERDACCIO_IMAGE}
if [ $? -ne 0 ]; then
    echo "Failed to start Verdaccio container."
    exit 1
fi

# Wait for Verdaccio to be ready
echo "Waiting for Verdaccio to start..."
sleep 10

# Check if Verdaccio is running
if ! curl -s ${REGISTRY_URL} > /dev/null; then
    echo "Verdaccio is not running on ${REGISTRY_URL}. Exiting."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Authenticate with Verdaccio
echo "Authenticating with Verdaccio..."
echo -e "test\ntest_password\ntest@domain.com\n" | pnpm adduser --registry ${REGISTRY_URL} --always-auth
if [ $? -ne 0 ]; then
    echo "Authentication with Verdaccio failed."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Publish the package
echo "Publishing package..."
pnpm publish --registry ${REGISTRY_URL} --no-git-checks
if [ $? -ne 0 ]; then
    echo "Publishing package failed."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Create a test directory and switch to it
mkdir test-install
cd test-install

# Install the package
echo "Installing package..."
pnpm add ${PACKAGE_NAME} --registry ${REGISTRY_URL}
if [ $? -ne 0 ]; then
    echo "Installing package failed."
    cd ..
    rm -rf test-install
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Run the package command
echo "Running package command..."
pnpx ${PACKAGE_NAME}
if [ $? -ne 0 ]; then
    echo "Running package command failed."
    cd ..
    rm -rf test-install
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Clean up
cd ..
rm -rf test-install

# Stop and remove the Verdaccio container
echo "Stopping and removing Verdaccio container..."
docker stop ${VERDACCIO_CONTAINER_NAME}
docker rm ${VERDACCIO_CONTAINER_NAME}

echo "Testing completed successfully!"

# Disable debugging
set +x
