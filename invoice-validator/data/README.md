# CEN/TC 434 - EN-16931 - Validation artefacts

Original can be found [here](https://github.com/ConnectingEurope/eInvoicing-EN16931/tree/c6725e16c40ee756d406a9766de0c1417312119c).

After changing any of schematron files regenerate XSLT and create SaxonJS schema:
Installation of maven & npm is required before running script.
```shell
./generate-schemas.sh
```

Sample UBL validation output can be found [here](ubl2.1/examples/response.xml).

For displaying proper documentation on web-app regenerate documentation as well:
```shell
./generate/schema-documentation.sh
```
