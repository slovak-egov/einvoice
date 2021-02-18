import {languages, schemas, skTranslations} from './constants.mjs'

export const getXPathQuery = (lang) =>
  lang === languages.EN ? '//svrl:failed-assert/svrl:text/text()' : '//svrl:failed-assert/@id'

export const getErrorMessage = (lang) => (failedAssert) =>
  lang === languages.EN ? failedAssert.data : (skTranslations[failedAssert.value] || `[${failedAssert.value}]`)

export const getSchema = (format) => schemas[format]
