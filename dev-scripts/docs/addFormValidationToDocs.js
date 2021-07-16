const fs = require('fs');

let invoiceTags = require('./../../data/schemas/ubl2.1/invoice-documentation.json');
let creditNoteTags = require('./../../data/schemas/ubl2.1/creditNote-documentation.json');
let validations = require('./../../data/formValidations.json');

const validationsToBusinessTerm = {}

Object.entries(validations).forEach(([id, doc]) => {
  validationsToBusinessTerm[doc.businessTerm] = id
})

const traverse = (obj) => {
  // console.log(obj)
  const validations = []
  if(obj.businessTerms) {
    obj.businessTerms.map((bt) => {
      if(validationsToBusinessTerm[bt]) {
        validations.push(validationsToBusinessTerm[bt])
      }
    })
  }
  if (validations.length > 0) {
    obj.formValidations = validations
  }
  if (typeof obj === 'object') {
    Object.values(obj).forEach((x) => traverse(x))
  }
}

traverse(invoiceTags)
traverse(creditNoteTags)

fs.writeFile('./../../data/schemas/ubl2.1/invoice-documentation.json', JSON.stringify(invoiceTags), function (err) {
  if (err) throw err;
});

fs.writeFile('./../../data/schemas/ubl2.1/creditNote-documentation.json', JSON.stringify(creditNoteTags), function (err) {
  if (err) throw err;
});
