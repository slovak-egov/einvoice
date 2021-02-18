# Invoice validator

Use `node v14.15.4`

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
* query param `lang` set to language in which you want to receive error messages (`en` or `sk`)
* body set to `{xml:<your_xml_string>}`.

It returns either `{ok: true}` if invoice is valid otherwise `{errors: [<error>]}`.
One can test it with
```shell
npm test
```
