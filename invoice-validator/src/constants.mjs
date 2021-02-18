import fs from 'fs'
import config from './config.mjs'

export const languages = {
  SK: 'sk',
  EN: 'en',
}

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b'
}

// Load schemas to memory
export const schemas = {
  [invoiceFormats.UBL]: JSON.parse(fs.readFileSync(config.ublSchemaPath)),
  [invoiceFormats.D16B]: JSON.parse(fs.readFileSync(config.d16bSchemaPath)),
}
// Load translations to memory
export const skTranslations = JSON.parse(fs.readFileSync(config.skRulesTranslationPath))
