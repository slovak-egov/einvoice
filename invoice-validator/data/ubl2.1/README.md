# CEN/TC 434 - EN-16931 - Validation artefacts

Original can be found [here](https://github.com/ConnectingEurope/eInvoicing-EN16931/tree/master/ubl/schematron).

After changing any of schematron files, install maven and then regenerate XSLT and create SaxonJS schema:
```shell
./update-xslt.sh

npx xslt3 -xsl:xslt/EN16931-UBL-validation-preprocessed.xslt -export:en16931-schema.sef.json -t -nogo
```

Sample validation output can be found [here](examples/response.xml).
