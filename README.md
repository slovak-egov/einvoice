# EInvoice

## OpenAPI 3 / Swagger

[OpenAPI 3 definition](docs/swagger.yml).

You can view it on this [website](https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml).

[Invoice validations](docs/validations.md)

[Api errors](docs/errors.md)

## Try it out

[https://web-app.dev.filipsladek.com](https://web-app.dev.filipsladek.com)

* user: E0000046137
* password: PopradTa3@

## Discussion

* [platforma.slovensko.digital](https://platforma.slovensko.digital/t/red-flags-informacny-system-elektronickej-fakturacie-is-efa/5640/83)

## Development

* Ensure `postgres` and `redis-server` services are running.

* Initialize DB

    Set proper env variables and run:

```shell script
./dev-scripts/start_service.sh migrations init
./dev-scripts/start_service.sh migrations up
 ```

* Export proper env variables for every service in `${server-name}/.env`.

```text
APISERVER_ENV=dev
...
```

* Run services you need:

```shell script
./dev-scripts/start_service.sh ${service-name}
```

* Finally run [web-app](web-app/README.md)

## Deployment

[VNet](dev-scripts/vnet/README.md)

## XML

Useful resources:

https://github.com/ConnectingEurope/eInvoicing-EN16931

### [UBL2.1](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017D1870#ntc2-L_2017266EN.01002101-E0002)

[Maindoc](http://docs.oasis-open.org/ubl/os-UBL-2.1/xsd)

From maindoc you need only [this](http://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-Invoice-2.1.xsd)
part.

### [D16B (SCRDM — CII)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017D1870#ntc1-L_2017266EN.01002101-E0001)

Subset for [CrossIndustryInvoice](https://www.unece.org/fileadmin/DAM/cefact/xml_schemas/D16B_SCRDM__Subset__CII.zip)

### Slovak law

* o zarucenej elektronickej fakturacii [215/2019](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2019/215/)
* o dani z pridanej hodnoty [222/2004](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2004/222/)
* o slobodnom pristupe k informaciam [211/2000](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2000/211/)

### EU regulation

* Directive on electronic invoicing in public procurement [2014/55/EU](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014L0055)
* Council Directive on the common system of value added tax [2006/112/EC](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32006L0112)
* Regulation on electronic identification and trust services for electronic transactions in the internal market [910/2014](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32014R0910)
* Commission Implementing Decision on the publication of the reference of the European standard on electronic invoicing and the list of its syntaxes pursuant to Directive [2017/1870](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017D1870)
