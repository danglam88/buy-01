#!/bin/bash -e

docker-compose down
docker system prune -a -f --volumes

if ! docker volume ls -q | grep -q '^mongo-volume$'; then
    docker volume create mongo-volume
fi

docker build -t user-microservice -f user/forfrontend/Dockerfile .

docker build -t product-microservice -f product/forfrontend/Dockerfile .

docker build -t media-microservice -f media/forfrontend/Dockerfile .

docker-compose up -d
