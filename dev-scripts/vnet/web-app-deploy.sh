#!/bin/bash

set -e

docker build -t samo98/einvoice-web-app -f Dockerfile-web-app .
docker push samo98/einvoice-web-app
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName dev-einvoice-mfsr --nodeGroup cp --tag latest
