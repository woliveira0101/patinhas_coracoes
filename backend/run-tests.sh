#!/bin/bash

# Create test-results directory if it doesn't exist
mkdir -p tests/test-results

# Ensure clean environment
docker compose -f docker-compose.test.yml down -v

# Run tests and save output to file
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test 2>&1 | tee tests/test-results/test-output.txt

# Store the exit code
TEST_EXIT_CODE=${PIPESTATUS[0]}

# Clean up after tests
docker compose -f docker-compose.test.yml down -v

# Exit with the test exit code
exit $TEST_EXIT_CODE
