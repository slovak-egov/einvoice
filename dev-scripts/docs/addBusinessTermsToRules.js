const fs = require('fs')

const regex = /(BG|BT)[-0-9]*/g;

let rules = require('./../../data/schemas/ubl2.1/rules-documentation.json');

Object.values(rules).forEach(rule => {
  const businessTerms = rule.message.en.match(regex);
  if (businessTerms) {
    rule.businessTerms = [...new Set(businessTerms)];
  }
});

fs.writeFile('./../../data/schemas/ubl2.1/rules-documentation.json', JSON.stringify(rules), function (err) {
  if (err) throw err;
  console.log('done');
});
