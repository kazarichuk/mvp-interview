#!/bin/bash

# Check if API key is provided
if [ -z "$1" ]; then
    echo "Please provide your OpenAI API key as an argument"
    echo "Usage: ./setup_api_key.sh your-api-key"
    exit 1
fi

# Update .env file with the provided API key
sed -i "s/your_openai_api_key_here/$1/" /root/interview-app/.env

# Restart the container to apply changes
cd /root/interview-app
docker-compose restart

echo "API key has been updated and container restarted"
echo "Checking server status..."
./check_server.sh 