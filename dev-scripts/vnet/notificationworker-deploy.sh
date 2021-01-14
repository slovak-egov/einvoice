#!/bin/bash

set -e

docker build -t samo98/einvoice-notificationworker -f Dockerfile-notificationworker .
docker push samo98/einvoice-notificationworker
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName dev-einvoice-api-mfsr --nodeGroup docker --tag latest
