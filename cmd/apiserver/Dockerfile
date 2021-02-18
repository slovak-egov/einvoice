FROM golang:1.15-alpine AS build_base

RUN apk update && apk add --no-cache g++ gcc libxml2 libxslt-dev

# Set the Current Working Directory inside the container
WORKDIR /tmp/einvoice

# Populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN go build -o /tmp/out/apiserver ./cmd/apiserver

# Start fresh from a smaller image
FROM alpine:3.12
RUN apk add --no-cache ca-certificates
RUN apk update && apk add --no-cache libxml2 libxslt-dev

COPY --from=build_base /tmp/out/apiserver /app/server
COPY --from=build_base /tmp/einvoice/data /app/data

CMD ["/app/server"]
