FROM node:14-alpine AS ui_builder

COPY web-app /client

WORKDIR /client
RUN npm install --production
RUN npm run build

FROM golang:1.15-alpine AS server_builder

RUN apk add --no-cache git

# Set the Current Working Directory inside the container
WORKDIR /server

# Populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN go build -o /out/server ./cmd/webserver

# Start fresh from a smaller image
FROM alpine:3.12
RUN apk add --no-cache ca-certificates

COPY --from=server_builder /out/server /app/server
COPY --from=ui_builder /client/build /app/build

CMD ["/app/server"]
