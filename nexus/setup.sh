#!/bin/bash -e

docker-compose down
docker system prune -a -f --volumes

if ! docker volume ls -q | grep -q '^nexus-data$'; then
    docker volume create nexus-data
fi

if ! docker volume ls -q | grep -q '^nexus-logs$'; then
    docker volume create nexus-logs
fi

if ! docker volume ls -q | grep -q '^nexus-blobs$'; then
    docker volume create nexus-blobs
fi

docker build -t nexus-image -f Dockerfile .

docker-compose up -d
