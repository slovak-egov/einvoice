#!/bin/bash

set -e

docker build -t samo98/einvoice-notificationworker -f Dockerfile-notificationworker .
docker push samo98/einvoice-notificationworker
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName einvoice-apiserver-cluster --nodeGroup docker --tag latest
