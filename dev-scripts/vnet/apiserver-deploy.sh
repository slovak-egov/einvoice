#!/bin/bash

set -e

docker build -t samo98/einvoice-apiserver -f Dockerfile-apiserver .
docker push samo98/einvoice-apiserver
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName dev-einvoice-api-mfsr --nodeGroup cp --tag latest
