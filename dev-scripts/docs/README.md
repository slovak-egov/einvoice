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

## Business terms to invoice xml tags

Run: 
```
node addTagsToBusinessTerms.js
```
to add tag paths to business term documentation.

## Rules to invoice xml tags

Run: 
```
node addTagsToRules.js
```
to add tag paths to rules documentation.

## Code lists to invoice xml tags

Run: 
```
node addTagsToCodeLists.js
```
to add tag paths to code lists documentation.
