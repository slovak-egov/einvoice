#!/bin/bash

set -e

docker build -t samo98/einvoice-cleanupworker -f Dockerfile-cleanupworker .
docker push samo98/einvoice-cleanupworker
"$JELASTIC_HOME"/environment/control/redeploycontainers --envName einvoice-apiserver-cluster --nodeGroup docker --tag latest
