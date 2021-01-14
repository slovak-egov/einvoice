# Errors

## Error response type

```json
{
  "error": "error code",
  "cause": "optional error message"
}
```

## Error codes

| Code | Status | Description | Cause |
| :--- | :----- | :---------- | :---- |
| authorization.unauthorized | 401 | Unauthorized | |
| authorization.missing | 401 | Authorization missing | |
| authorization.type.invalid | 401 | Unexpected authorization type | |
| authorization.apiKey.sub.missing | 401 | Missing *sub* claim in jwt token | |
| authorization.apiKey.sub.wrongType | 401 | *sub* claim must be integer | |
| authorization.apiKey.sub.notFound | 401 | Unknown user id | |
| authorization.apiKey.exp.missing | 401 | Missing *exp* claim in jwt token | |
| authorization.apiKey.exp.wrongType | 401 | *exp* claim must be integer | |
| authorization.apiKey.exp.expired | 401 | Token expired | |
| authorization.apiKey.exp.tooLong | 401 | Maximal expiration time is 10 minutes | |
| authorization.apiKey.jti.missing | 401 | Missing *jti* claim in jwt token | |
| authorization.apiKey.jti.wrongType | 401 | *jti* claim must be string | |
| authorization.apiKey.jti.invalid | 401 | *jti* must be in the correct format |  |
| authorization.apiKey.jti.reused | 401 | *jti* cannot be reused in 15 minutes | |
| authorization.apiKey.sign.method.invalid | 401 | Sign algorithm must be RS256 | |
| authorization.apiKey.claims.parsingError | 401 | Cannot parse claims | |
| authorization.apiKey.publicKey.invalid | 401 | Cannot parse stored public key |  |
| authorization.apiKey.sign.invalid | 401 | Signature is invalid | |
| authorization.bearer.invalid | 401 | Cannot parse bearer token | |
| authorization.slovenskoSk.request.failed | 424 | SlovenskoSk login request failed | |
| invoice.payload.invalid | 400 | Cannot parse data | Error message |
| invoice.file.parsingError | 400 | Cannot parse invoice file | Error message |
| invoice.test.invalid | 400 | Cannot parse *test* field | Error message |
| invoice.format.missing | 400 | Missing *format* field | |
| invoice.format.unknown | 400 | *format* must be ubl2.1 or d16b | |
| invoice.xsd.validation.failed | 400 | Xml file must follow XSD schema | Error message |
| invoice.validation.failed | 400 | Invoice must contain all required fields | Comma separated error codes from [Validation errors](validations.md) |
| invoice.create.permission.missing | 403 | Missing permissions for creating invoices with posted IČO | |
| invoice.view.permission.missing | 403 | Missing permissions for requested invoice | |
| invoice.param.parsingError | 400 | Cannot parse params | Error message |
| invoice.param.invalid | 400 | Params validation failed | Error message |
| invoice.param.id.invalid | 400 | Invoice id must be integer | Error message |
| invoice.notFound | 404 | Invoice not found | |
| substitute.body.parsingError | 400 | Cannot parse data | Error message |
| substitute.body.empty | 400 | Missing substitute data | |
| substitute.create.failed | 400 | Cannot create substitute | Error message |
| user.id.invalid | 400 | User id must be integer | Error message |
| user.parsingError | 400 | Cannot parse user data | Error message |
| user.validation.failed | 400 | User data validation failed | Error message |
| invoice.test.rateLimit | 429 | Rate limit for creating test invoices reached | |