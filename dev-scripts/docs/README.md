# Documentation scripts

## Rules to business terms cross links

Run: 
```
node addBusinessTermsToRules.js
```
to parse and add business term ids to rules documentation.

## Business terms to rules cross links

Run: 
```
node addRulesToBusinessTerms.js
```
to add rule ids to business term documentation. Uses ids parsed in previous step.

## Cross links to invoice xml tags

Run: 
```
node addTagsToDocs.js
```
to add tag paths to business terms, code lists and rules documentation.
