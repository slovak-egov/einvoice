const fs = require('fs');

let rules = require('./../../data/schemas/ubl2.1/rules-documentation.json');
let invoiceTags = require('./../../data/schemas/ubl2.1/invoice-documentation.json');
let creditNoteTags = require('./../../data/schemas/ubl2.1/creditNote-documentation.json');

parseTag = (path, tag, fieldName) => {
  if (tag.rules) {
    tag.rules.forEach(rule => {
      if (!rules[rule][fieldName]) rules[rule][fieldName] = new Set();
      rules[rule][fieldName].add([...path])
    });
  }
  if (tag.children) {
    Object.entries(tag.children).forEach(([name, child]) => {
      path.push(name);
      parseTag(path, child, fieldName);
      path.pop();
    })
  }
}

parseDoc = (doc, fieldName) => {
  Object.values(rules).forEach(rule => delete rule[fieldName]);

  Object.entries(doc).forEach(([name, tag]) => parseTag([name], tag, fieldName));

  Object.values(rules).forEach(rule => {
    if (rule[fieldName]) {
      rule[fieldName] = Array.from(rule[fieldName]);
    }
  });
}

parseDoc(invoiceTags, 'invoiceTags');
parseDoc(creditNoteTags, 'creditNoteTags');

fs.writeFile('./../../data/schemas/ubl2.1/rules-documentation.json', JSON.stringify(rules), function (err) {
  if (err) throw err;
  console.log('done');
});
