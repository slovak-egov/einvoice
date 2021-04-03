import fetch from 'node-fetch'
import {promises as fs} from 'fs'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8082
const format = process.env.INVOICE_FORMAT || 'ubl2.1';

(async () => {
  const res = await fetch(`http://${host}:${port}?format=${format}`, {
    headers: {"Content-Type": "application/xml"},
    method: 'POST',
    body: await fs.readFile('../data/examples/ubl2.1/invoice-rules-violation.xml', 'utf-8'),
  })
  console.log(res.status)
  console.log(await res.json())
})()
