FROM node:15-alpine AS schema_builder

COPY ./invoice-validator/data /data

RUN apk add maven --no-cache

WORKDIR /data
RUN ./generate-schemas.sh

# Start fresh
FROM node:15-alpine

WORKDIR /app

COPY invoice-validator/package.json .
COPY invoice-validator/package-lock.json .

RUN npm i --production

COPY invoice-validator/src src

COPY --from=schema_builder /data/ubl2.1/en16931-schema.sef.json schemas/ubl2.1-schema.sef.json
COPY --from=schema_builder /data/d16b/en16931-schema.sef.json schemas/d16b-schema.sef.json
COPY --from=schema_builder /data/sk-rules-translation.json data/sk-rules-translation.json

CMD [ "npm", "start" ]
