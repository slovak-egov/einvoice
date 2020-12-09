# Invoice validations

## XSD schema

Invoice in xml file must follow one of UBL2.1 or D16B XSD schema.

## Slovak law

| Error name | Description |
| :--- | :----------- |
| supplier.undefined | Supplier must be defined |
| supplier.name.undefined | Supplier name must be defined |
| supplier.address.undefined | Supplier address must be defined |
| supplier.address.country.undefined | Supplier country must be defined in address |
| supplier.address.city.undefined | Supplier city must be defined in address |
| supplier.address.building.number.undefined | Supplier building number must be defined in address |
| supplier.ico.undefined | Supplier IČO must be defined |
| supplier.ico.multiple | Supplier must not have multiple IČO |
| customer.undefined | Supplier must be defined |
| customer.name.undefined | Customer name must be defined |
| customer.address.undefined | Customer address must be defined |
| customer.address.country.undefined | Customer country must be defined in address |
| customer.address.city.undefined | Customer city must be defined in address |
| customer.address.building.number.undefined | Customer building number must be defined in address |
| customer.ico.undefined | Customer IČO must be defined |
| customer.ico.multiple | Customer must not have multiple IČO |
| price.undefined | Total price must be defined |
| price.value.parsingError | Price must be number |
| issueDate.undefined | Issue date must be defined |
| issueDate.parsingError | Issue date must be in format 2020-12-24 |
| testParameter.invalid | If test is defined it should be 'true' or 'false' |
