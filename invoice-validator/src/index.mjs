import express from 'express'
import fs from 'fs'
import SaxonJS from 'saxon-js'

const app = express()
const port = process.env.PORT || 8082
const ublSchemaPath = process.env.UBL_SCHEMA_PATH || 'data/ubl2.1/en16931-schema.sef.json'
const d16bSchemaPath = process.env.D16B_SCHEMA_PATH || 'data/d16b/en16931-schema.sef.json'

app.use(express.json())

app.post('/', async (req, res) => {
  if (!['ubl2.1', 'd16b'].includes(req.query.format)) {
    res.status(400).send({error: 'unknown format'})
    return
  }

  try {
    const {principalResult} = await SaxonJS.transform({
        stylesheetInternal: schemas[req.query.format],
        sourceText: req.body.xml,
        destination: 'document',
    }, 'async')

    // Find failed asserts in result
    let result = SaxonJS.XPath.evaluate('.//*:failed-assert/*:text/text()', principalResult)
    if (result == null) {
      res.send({ok: true})
    } else {
      if(!Array.isArray(result)) result = [result]
      res.status(400).send({errors: result.map((failedAssert) => failedAssert.data)})
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({error: e})
  }
})

// Load schemas to memory
const schemas = {
  'ubl2.1': JSON.parse(fs.readFileSync(ublSchemaPath)),
  'd16b': JSON.parse(fs.readFileSync(d16bSchemaPath)),
}

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
