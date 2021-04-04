export default {
  port: process.env.PORT || 8082,
  ublSchemaPath: process.env.UBL_SCHEMA_PATH || 'data/ubl2.1/en16931-schema.sef.json',
  d16bSchemaPath: process.env.D16B_SCHEMA_PATH || 'data/d16b/en16931-schema.sef.json',
}
