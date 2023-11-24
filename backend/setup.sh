#!/bin/bash -e

docker-compose down
docker system prune -a -f --volumes

if ! docker volume ls -q | grep -q '^mongo-volume$'; then
    docker volume create mongo-volume
fi

cp user/forfrontend/Dockerfile user/
docker build -t user-microservice -f user/Dockerfile .

cp product/forfrontend/Dockerfile product/
docker build -t product-microservice -f product/Dockerfile .

cp media/forfrontend/Dockerfile media/
docker build -t media-microservice -f media/Dockerfile .

docker-compose up -d
