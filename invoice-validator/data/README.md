# CEN/TC 434 - EN-16931 - Validation artefacts

Original can be found [here](https://github.com/ConnectingEurope/eInvoicing-EN16931/tree/677968e068f35e249cffda04e6eea0782219fb24).

After changing any of schematron files regenerate XSLT and create SaxonJS schema:
Installation of maven & npm is required before running script.
```shell
./generate-schemas.sh
```

Sample UBL validation output can be found [here](ubl2.1/examples/response.xml).
