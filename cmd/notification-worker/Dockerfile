FROM golang:1.16-alpine AS build_base

RUN apk update && apk add --no-cache g++ gcc libxml2 libxslt-dev

# Set the Current Working Directory inside the container
WORKDIR /tmp/einvoice

# Populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN go build -o /tmp/out/notification-worker ./cmd/notification-worker

# Start fresh from a smaller image
FROM alpine:3.13
RUN apk add --no-cache ca-certificates

COPY --from=build_base /tmp/out/notification-worker /worker/notification-worker
COPY --from=build_base /tmp/einvoice/data/fonts /app/data/fonts

CMD ["/worker/notification-worker"]
