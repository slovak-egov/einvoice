import express from 'express'
import fs from 'fs'
import SaxonJS from 'saxon-js'

const app = express()
const port = process.env.PORT || 8082
const ublSchemaPath = process.env.UBL_SCHEMA_PATH || 'data/ubl2.1/en16931-schema.sef.json'

app.use(express.json())

app.post('/', async (req, res) => {
  try {
    const {principalResult} = await SaxonJS.transform({
        stylesheetInternal: schema,
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

// Load schema to memory
const schema = JSON.parse(fs.readFileSync(ublSchemaPath))

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
