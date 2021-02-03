# Invoice validator

Use `node v14.15.4`

First install dependencies
```shell
npm i
```

If you want to update schema, follow [this](data/ubl2.1/README.md).

Then run
```shell
npm start
```

Sending POST request to `/` with body `{xml:<your_xml_string>}` returns either `{ok: true}` if invoice is valid
otherwise `{errors: [<error>]}`.
One can test it with
```shell
npm test
```
