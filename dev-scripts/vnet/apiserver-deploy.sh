#!/bin/bash

docker build -t samo98/einvoice-apiserver -f Dockerfile-apiserver .
docker push samo98/einvoice-apiserver
$JELASTIC_HOME/environment/control/redeploycontainers --envName einvoice-apiserver --nodeGroup cp --tag latest
