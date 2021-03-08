FROM node:15-alpine AS schema_builder

COPY ./invoice-validator/data /data

RUN apk add maven --no-cache

WORKDIR /data
RUN ./generate-schemas.sh

# Start fresh
FROM node:15-alpine

COPY --from=schema_builder /data/ubl2.1/en16931-schema.sef.json /app/schemas/ubl2.1-schema.sef.json
COPY --from=schema_builder /data/d16b/en16931-schema.sef.json /app/schemas/d16b-schema.sef.json
COPY --from=schema_builder /data/sk-rules-translation.json /app/data/sk-rules-translation.json
COPY ./invoice-validator/src /app/src
COPY ./invoice-validator/package.json /app/package.json
COPY ./invoice-validator/package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm i --production

CMD [ "npm", "start" ]
