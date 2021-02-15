#!/bin/bash

set -ex

service=$1
shift

# Check if valid service name was provided
if ! [[ "$service" =~ ^(cmd/webserver|cmd/apiserver|cmd/migrations|cmd/notification-worker|cmd/cleanup-worker|cmd/upvs-mock)$ ]]; then
  echo Service "$service" does not exist.
  exit 1
fi

# Move to project root directory
cd "$(dirname "$0")"/..
# Load env variables
if [ ! -f "$service"/.env ]; then
    echo "$service"/.env not found. Create it and fill with env variables.
    exit 1
fi
# shellcheck disable=SC2046
export $(xargs < "$service"/.env)

# Run go service
go run ./"$service" "$@"
