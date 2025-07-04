#!/bin/bash

# Load Testing Script

echo "Starting load tests..."

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "k6 is not installed. Installing k6..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install k6
    else
        echo "Please install k6 manually from https://k6.io/docs/getting-started/installation"
        exit 1
    fi
fi

# Environment setup
export NODE_ENV=test
export LOAD_TEST=true

# Start the application in test mode (implement this based on your setup)
echo "Starting application in test mode..."
npm run start:test &
APP_PID=$!

# Wait for the application to be ready
echo "Waiting for application to start..."
sleep 10

# Run the load tests
echo "Running authentication load tests..."
k6 run load-tests/auth.test.js

echo "Running firms load tests..."
k6 run load-tests/firms.test.js

# Clean up
echo "Cleaning up..."
kill $APP_PID

echo "Load testing completed!"
