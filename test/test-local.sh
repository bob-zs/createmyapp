#!/bin/bash

# Parse command-line arguments for debug mode
DEBUG_MODE=0
for arg in "$@"
do
    if [ "$arg" == "--debug" ]; then
        DEBUG_MODE=1
    fi
done

# Enable debugging if the --debug flag is set
if [ $DEBUG_MODE -eq 1 ]; then
    set -x
fi

# Function to handle cleanup
handle_exit() {
    echo "Cleaning up..."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    rm -rf ${TMP_DIR}
    echo "Cleanup completed."
}

# Cleanup before exit on any termination signal
trap 'handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# ------------------------------
# Check if Docker is running and start if not
echo -e "\n### Checking if Docker is running ###"
if ! docker info > /dev/null 2>&1; then
    echo "Starting Docker..."
    open -a Docker || sudo systemctl start docker
    echo "Waiting for Docker to start..."
    sleep 30  # Adjust sleep duration if needed
fi

# ------------------------------
# Define variables
echo -e "\n### Defining Variables ###"
VERDACCIO_IMAGE="verdaccio/verdaccio"
VERDACCIO_CONTAINER_NAME="verdaccio"
VERDACCIO_PORT="4873"
REGISTRY_URL="http://localhost:${VERDACCIO_PORT}"
USERNAME="test"
PASSWORD="test_password"
EMAIL="test@domain.com"
TMP_DIR=$(mktemp -d)

# ------------------------------
# Extract package name from package.json using Node.js
echo -e "\n### Extracting Package Name ###"
PACKAGE_NAME=$(node -p "require('./package.json').name")
echo "Package name: ${PACKAGE_NAME}"

# ------------------------------
# Stop and remove any existing Verdaccio container
echo -e "\n### Stopping and Removing Existing Verdaccio Container ###"
if [ "$(docker ps -q -f name=${VERDACCIO_CONTAINER_NAME})" ]; then
    echo "Stopping existing Verdaccio container..."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    echo "Removing existing Verdaccio container..."
    docker rm ${VERDACCIO_CONTAINER_NAME}
fi

# ------------------------------
# Start Verdaccio in Docker
echo -e "\n### Starting Verdaccio ###"
docker run -d --name ${VERDACCIO_CONTAINER_NAME} -p ${VERDACCIO_PORT}:${VERDACCIO_PORT} ${VERDACCIO_IMAGE}
if [ $? -ne 0 ]; then
    echo "Failed to start Verdaccio container."
    exit 1
fi

# ------------------------------
# Wait for Verdaccio to be ready
echo -e "\n### Waiting for Verdaccio to be Ready ###"
READY=0
for i in {1..30}; do
    if curl -s ${REGISTRY_URL} > /dev/null; then
        READY=1
        break
    fi
    echo "Waiting for Verdaccio... (${i})"
    sleep 2
done

if [ ${READY} -ne 1 ]; then
    echo "Verdaccio did not become ready in time."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# ------------------------------
# Authenticate with Verdaccio using npm-cli-login
echo -e "\n### Authenticating with Verdaccio ###"
LOGIN_OUTPUT=$(npx npm-cli-login -u ${USERNAME} -p ${PASSWORD} -e ${EMAIL} -r ${REGISTRY_URL} 2>&1)
if [ $? -ne 0 ]; then
    echo "Authentication with Verdaccio failed."
    echo "${LOGIN_OUTPUT}"
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi
echo "${LOGIN_OUTPUT}"

# ------------------------------
# Publish the package
echo -e "\n### Publishing Package ###"
pnpm publish --registry ${REGISTRY_URL} --no-git-checks
if [ $? -ne 0 ]; then
    echo "Publishing package failed."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# ------------------------------
# Verify package is published
echo -e "\n### Verifying Package Information ###"
pnpm info ${PACKAGE_NAME} --registry ${REGISTRY_URL}
if [ $? -ne 0 ]; then
    echo "Package information could not be retrieved. Exiting."
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# ------------------------------
# Create a test directory and switch to it
echo -e "\n### Creating Test Directory ###"
mkdir ${TMP_DIR}/test-install
cd ${TMP_DIR}/test-install

# ------------------------------
# Run the package command directly using pnpx with the correct registry and capture output
echo -e "\n### Running Package Command ###"
PACKAGE_OUTPUT=$(pnpx create-my-app my-app 2>&1)
PACKAGE_EXIT_CODE=$?
echo "Package command output:"
echo "${PACKAGE_OUTPUT}"
if [ ${PACKAGE_EXIT_CODE} -ne 0 ]; then
    echo "Running package command failed."
    cd ..
    rm -rf ${TMP_DIR}
    docker stop ${VERDACCIO_CONTAINER_NAME}
    docker rm ${VERDACCIO_CONTAINER_NAME}
    exit 1
fi

# ------------------------------
# List the created directory
echo -e "\n### Listing Created Directory ###"
ls -l my-app

# ------------------------------
# Clean up
echo -e "\n### Cleaning Up ###"
cd ..
rm -rf ${TMP_DIR}

# ------------------------------
# Stop and remove the Verdaccio container
echo -e "\n### Stopping and Removing Verdaccio Container ###"
docker stop ${VERDACCIO_CONTAINER_NAME}
docker rm ${VERDACCIO_CONTAINER_NAME}

echo -e "\n### Testing Completed Successfully! ###"

# Disable debugging if it was enabled
if [ $DEBUG_MODE -eq 1 ]; then
    set +x
fi
