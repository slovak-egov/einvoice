import fetch from 'node-fetch'
import {promises as fs} from 'fs'

const port = process.env.PORT || 8082;

(async () => {
  const xml = await fs.readFile('../data/examples/ubl2.1/invoice.xml', 'utf-8')
  const res = await fetch(`http://localhost:${port}`, {
    headers: {"Content-Type": "application/json"},
    method: 'POST',
    body: JSON.stringify({xml})
  })
  console.log(res.status)
  console.log(await res.json())
})()
