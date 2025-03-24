#!/bin/bash

# Update system
apt-get update
apt-get install -y docker.io docker-compose

# Start Docker service
systemctl start docker
systemctl enable docker

# Create a directory for the application
mkdir -p /root/interview-app
cd /root/interview-app

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/kazarichuk/ai_model.git .

# Copy environment variables
cp .env.example .env

# Build and start the Docker container
docker-compose up -d --build

# Print the public IP and port
echo "Application is running on:"
echo "http://$(curl -s ifconfig.me):8000"

# Print instructions
echo "Please update the OPENAI_API_KEY in .env file with your actual API key"
echo "Then restart the container with: docker-compose restart" 