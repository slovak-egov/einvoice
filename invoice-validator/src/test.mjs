import fetch from 'node-fetch'
import {promises as fs} from 'fs'

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8082;

(async () => {
  const xml = await fs.readFile('../data/examples/ubl2.1/invoice.xml', 'utf-8')
  const res = await fetch(`http://${host}:${port}?format=ubl2.1`, {
    headers: {"Content-Type": "application/json"},
    method: 'POST',
    body: JSON.stringify({xml})
  })
  console.log(res.status)
  console.log(await res.json())
})()
