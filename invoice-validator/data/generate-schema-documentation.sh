#!/bin/sh

set -ex

SCHEMATRON_FILE=ubl2.1/schematron/preprocessed/EN16931-UBL-validation-preprocessed.sch OUTPUT=../../data/schemas/ubl2.1/rules-documentation.json go run rulesDocumentation/main.go

SCHEMATRON_FILE=d16b/schematron/preprocessed/EN16931-CII-validation-preprocessed.sch OUTPUT=../../data/schemas/d16b/rules-documentation.json go run rulesDocumentation/main.go
