import fetch from 'node-fetch'
import {promises as fs} from 'fs'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8082
const format = process.env.INVOICE_FORMAT || 'ubl2.1'
const lang = process.env.RESPONSE_LANGUAGE || 'sk' ;

(async () => {
  const xml = await fs.readFile('../data/examples/ubl2.1/invoice-rules-violation.xml', 'utf-8')
  const res = await fetch(`http://${host}:${port}?format=${format}&lang=${lang}`, {
    headers: {"Content-Type": "application/json"},
    method: 'POST',
    body: JSON.stringify({xml})
  })
  console.log(res.status)
  console.log(await res.json())
})()
