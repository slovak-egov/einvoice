#!/bin/bash

set -e

# Move to project root directory
cd "$(dirname "$0")"/../..

case "$1" in
  apiserver)
    DOCKER_NAME="samo98/einvoice-apiserver"
    DOCKER_FILE="cmd/apiserver/Dockerfile"
    ENV_NAME="dev-einvoice-api-mfsr"
    NODE_GROUP="cp"
    ;;

  web-app)
    DOCKER_NAME="samo98/einvoice-web-app"
    DOCKER_FILE="cmd/webserver/Dockerfile"
    ENV_NAME="dev-einvoice-mfsr"
    NODE_GROUP="cp"
    ;;

  notification-worker)
    DOCKER_NAME="samo98/einvoice-notificationworker"
    DOCKER_FILE="cmd/notification-worker/Dockerfile"
    ENV_NAME="dev-einvoice-api-mfsr"
    NODE_GROUP="docker"
    ;;

  cleanup-worker)
    DOCKER_NAME="samo98/einvoice-cleanupworker"
    DOCKER_FILE="cmd/cleanup-worker/Dockerfile"
    ENV_NAME="dev-einvoice-api-mfsr"
    NODE_GROUP="docker2"
    ;;

  invoice-validator)
    DOCKER_NAME="samo98/einvoice-invoice-validator"
    DOCKER_FILE="invoice-validator/Dockerfile"
    ENV_NAME="dev-einvoice-validator"
    NODE_GROUP="cp"
    ;;

  *)
    echo "unknown service"
    exit 1
    ;;
esac

docker build -t $DOCKER_NAME -f $DOCKER_FILE .
docker push $DOCKER_NAME
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName $ENV_NAME --nodeGroup $NODE_GROUP --tag latest
