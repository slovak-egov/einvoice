#!/bin/bash

set -e

docker build -t samo98/einvoice-cleanupworker -f Dockerfile-cleanupworker .
docker push samo98/einvoice-cleanupworker
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName dev-einvoice-api-mfsr --nodeGroup docker --tag latest
