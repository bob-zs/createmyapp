#!/bin/bash

# Enable debugging
set -x

# Define variables
VERDACCIO_IMAGE="verdaccio/verdaccio"
VERDACCIO_CONTAINER_NAME="verdaccio"
VERDACCIO_PORT="4873"
REGISTRY_URL="http://localhost:${VERDACCIO_PORT}"
PACKAGE_NAME="@bob-zs/createmyapp"
USERNAME="test"
PASSWORD="test_password"
EMAIL="test@domain.com"
TMP_DIR=$(mktemp -d)

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

# Authenticate with Verdaccio using npm-cli-login
echo "Authenticating with Verdaccio..."
npx npm-cli-login -u ${USERNAME} -p ${PASSWORD} -e ${EMAIL} -r ${REGISTRY_URL}
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

# Verify package is published
echo "Checking package information..."
pnpm info ${PACKAGE_NAME} --registry ${REGISTRY_URL}
if [ $? -ne 0 ]; then
    echo "Package information could not be retrieved. Exiting."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Create a test directory and switch to it
mkdir ${TMP_DIR}/test-install
cd ${TMP_DIR}/test-install

# Install the package
echo "Installing package..."
pnpm add ${PACKAGE_NAME} --registry ${REGISTRY_URL}
if [ $? -ne 0 ]; then
    echo "Installing package failed."
    cd ..
    rm -rf ${TMP_DIR}
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Run the package command and check if files were created
echo "Running package command..."
pnpx create-my-app && ls -l
if [ $? -ne 0 ]; then
    echo "Running package command failed."
    cd ..
    rm -rf ${TMP_DIR}
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# Clean up
cd ..
rm -rf ${TMP_DIR}

# Stop and remove the Verdaccio container
echo "Stopping and removing Verdaccio container..."
docker stop ${VERDACCIO_CONTAINER_NAME}
docker rm ${VERDACCIO_CONTAINER_NAME}

echo "Testing completed successfully!"

# Disable debugging
set +x
