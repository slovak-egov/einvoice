# Invoice validator

Use `node v15`

First install dependencies
```shell
npm i
```

If you want to update schema, follow [this](data/README.md).

Then run
```shell
npm start
```

Send POST request to `/` with:
* query param `format` set to format of your invoice (`ubl2.1` or `d16b`)
* Content-Type set to `application/xml`
* body set to XML to be validated.

It returns either `{ok: true}` if invoice is valid otherwise `{errors: [ruleId]}`.
One can test it with
```shell
npm test
```
