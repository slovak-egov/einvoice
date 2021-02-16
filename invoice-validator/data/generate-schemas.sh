#!/bin/sh

set -ex

mvn -f pom-preprocess.xml generate-resources

mvn -f pom-xslt.xml process-resources

npx xslt3 -xsl:ubl2.1/xslt/EN16931-UBL-validation-preprocessed.xslt -export:ubl2.1/en16931-schema.sef.json -t -nogo

npx xslt3 -xsl:d16b/xslt/EN16931-CII-validation-preprocessed.xslt -export:d16b/en16931-schema.sef.json -t -nogo
