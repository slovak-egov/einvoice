import express from 'express'
import SaxonJS from 'saxon-js'
import config from './config.mjs'
import {invoiceFormats, schemas} from './constants.mjs'

const app = express()

app.use(express.text({limit: '10mb', type: 'application/xml'}))

app.post('/', async (req, res) => {
  if (!Object.values(invoiceFormats).includes(req.query.format)) {
    res.status(400).send({error: 'unknown format'})
    return
  }

  try {
    const {principalResult} = await SaxonJS.transform({
        stylesheetInternal: schemas[req.query.format],
        sourceText: req.body,
        destination: 'document',
    }, 'async')

    // Find failed asserts in result
    let result = SaxonJS.XPath.evaluate(
      '//svrl:failed-assert/@id',
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
        errors: result.map((v) => v.value)
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
