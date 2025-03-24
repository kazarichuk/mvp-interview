#!/bin/bash

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    echo "Docker is not running. Starting Docker..."
    systemctl start docker
fi

# Check if container is running
if ! docker ps | grep -q "interview-app"; then
    echo "Container is not running. Starting container..."
    docker-compose up -d
fi

# Check container logs
echo "Container logs:"
docker-compose logs --tail=50

# Check if API is responding
echo "Checking API response..."
curl -s http://localhost:8000/health || echo "API is not responding"

# Print container status
echo "Container status:"
docker ps 