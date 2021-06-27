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

FROM surnet/alpine-wkhtmltopdf:3.13.5-0.12.6-small as wkhtmltopdf

# Start fresh from a smaller image
FROM alpine:3.13
RUN apk update && apk add --no-cache \
  libxml2 \
  libxslt-dev \
  libstdc++ \
  libx11 \
  libxrender \
  libxext \
  libssl1.1 \
  ca-certificates \
  fontconfig \
  freetype \
  ttf-dejavu \
  ttf-droid \
  ttf-freefont \
  ttf-liberation \
  ttf-ubuntu-font-family

COPY --from=build_base /tmp/out/notification-worker /worker/notification-worker
COPY --from=build_base /tmp/einvoice/data /app/data
COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/wkhtmltopdf

CMD ["/worker/notification-worker"]
