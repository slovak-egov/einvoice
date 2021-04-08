const fs = require('fs')

let businessTerms = require('./../../data/schemas/businessTerms/docs.json');
let rules = require('./../../data/schemas/ubl2.1/rules-documentation.json');

Object.values(businessTerms).forEach(bt => delete bt.rules);

Object.entries(rules).forEach(([ruleId, rule]) => {
  if (rule.businessTerms) {
    rule.businessTerms.forEach(bt => {
      if (!businessTerms[bt].rules) businessTerms[bt].rules = new Set();
      businessTerms[bt].rules.add(ruleId);
    });
  }
});

Object.values(businessTerms).forEach(bt => {
  if (bt.rules) {
    bt.rules = Array.from(bt.rules);
  }
});

fs.writeFile('./data/schemas/businessTerms/docs.json', JSON.stringify(businessTerms), function (err) {
  if (err) throw err;
  console.log('saved');
});
