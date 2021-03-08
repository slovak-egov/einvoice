FROM node:15-alpine AS ui_builder

WORKDIR /client
COPY web-app/package.json .
COPY web-app/package-lock.json .

RUN npm install --production

COPY web-app/src /client/src
COPY web-app/public /client/public

RUN npm run build

FROM golang:1.16-alpine AS server_builder

# Set the Current Working Directory inside the container
WORKDIR /server

# Populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN go build -o /out/server ./cmd/webserver

# Start fresh from a smaller image
FROM alpine:3.13
RUN apk add --no-cache ca-certificates

COPY --from=server_builder /out/server /app/server
COPY --from=ui_builder /client/build /app/build

CMD ["/app/server"]
