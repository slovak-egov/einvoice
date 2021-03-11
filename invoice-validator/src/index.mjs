import express from 'express'
import SaxonJS from 'saxon-js'
import config from './config.mjs'
import {invoiceFormats, languages} from './constants.mjs'
import {getXPathQuery, getErrorMessage, getSchema} from './helpers.mjs'

const app = express()

app.use(express.json())

app.post('/', async (req, res) => {
  if (!Object.values(invoiceFormats).includes(req.query.format)) {
    res.status(400).send({error: 'unknown format'})
    return
  }

  if (!Object.values(languages).includes(req.query.lang)) {
    req.query.lang = 'en'
  }

  try {
    const {principalResult} = await SaxonJS.transform({
        stylesheetInternal: getSchema(req.query.format),
        sourceText: req.body.xml,
        destination: 'document',
    }, 'async')

    // Find failed asserts in result
    let result = SaxonJS.XPath.evaluate(
      getXPathQuery(req.query.lang),
      principalResult,
      {
        namespaceContext: {svrl: 'http://purl.oclc.org/dsdl/svrl'},
        resultForm: 'array',
      }
    )

    if (result.length === 0) {
      res.send({ok: true})
    } else {
      res.status(400).send({
        errors: result.map(getErrorMessage(req.query.lang))
      })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({error: e})
  }
})

app.listen(config.port, () => {
  console.log(`App listening at port ${config.port}`)
})
