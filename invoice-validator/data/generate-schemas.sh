#!/bin/sh

set -ex

mvn -f pom-preprocess.xml generate-resources

mvn -f pom-xslt.xml process-resources

npx xslt3 -xsl:ubl2.1/xslt/EN16931-UBL-validation-preprocessed.xslt -export:ubl2.1/en16931-schema.sef.json -t -nogo

npx xslt3 -xsl:d16b/xslt/EN16931-CII-validation-preprocessed.xslt -export:d16b/en16931-schema.sef.json -t -nogo

SCHEMATRON_FILE=ubl2.1/schematron/preprocessed/EN16931-UBL-validation-preprocessed.sch OUTPUT=../../data/schemas/ubl2.1/rules-documentation.json go run rulesDocumentation/main.go

SCHEMATRON_FILE=d16b/schematron/preprocessed/EN16931-CII-validation-preprocessed.sch OUTPUT=../../data/schemas/d16b/rules-documentation.json go run rulesDocumentation/main.go
