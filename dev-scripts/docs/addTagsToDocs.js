const fs = require('fs');

let businessTerms = require('./../../data/schemas/businessTerms/docs.json');
let codeLists = require('./../../data/codeLists.json');
let rules = require('./../../data/schemas/ubl2.1/rules-documentation.json');
let invoiceTags = require('./../../data/schemas/ubl2.1/invoice-documentation.json');
let creditNoteTags = require('./../../data/schemas/ubl2.1/creditNote-documentation.json');

parseNode = (path, tag, fieldName) => {
  if (tag.businessTerms) {
    tag.businessTerms.forEach(bt => {
      if (!businessTerms[bt][fieldName]) businessTerms[bt][fieldName] = new Set();
      businessTerms[bt][fieldName].add([...path])
    });
  }
  if (tag.codeLists) {
    tag.codeLists.forEach(codeList => {
      if (!codeLists[codeList][fieldName]) codeLists[codeList][fieldName] = new Set();
      codeLists[codeList][fieldName].add([...path])
    });
  }
  if (tag.rules) {
    tag.rules.forEach(rule => {
      if (!rules[rule][fieldName]) rules[rule][fieldName] = new Set();
      rules[rule][fieldName].add([...path])
    });
  }
  if (tag.children) {
    Object.entries(tag.children).forEach(([name, child]) => {
      path.push(name);
      parseNode(path, child, fieldName);
      path.pop();
    })
  }
  if (tag.attributes) {
    Object.entries(tag.attributes).forEach(([name, child]) => {
      path.push('@' + name);
      parseNode(path, child, fieldName);
      path.pop();
    })
  }
}

parseDoc = (doc, fieldName) => {
  [businessTerms, codeLists, rules].forEach(doc => {
    Object.values(doc).forEach(row => delete row[fieldName]);
  });

  Object.entries(doc).forEach(([name, tag]) => parseNode([name], tag, fieldName));

  [businessTerms, codeLists, rules].forEach(doc => {
    Object.values(doc).forEach(row => {
      if (row[fieldName]) {
        row[fieldName] = Array.from(row[fieldName]);
      }
    });
  });
}

parseDoc(invoiceTags, 'invoiceTags');
parseDoc(creditNoteTags, 'creditNoteTags');

fs.writeFile('./../../data/schemas/businessTerms/docs.json', JSON.stringify(businessTerms), function (err) {
  if (err) throw err;
  console.log('business terms done');
});
fs.writeFile('./../../data/codeLists.json', JSON.stringify(codeLists), function (err) {
  if (err) throw err;
  console.log('code lists done');
});
fs.writeFile('./../../data/schemas/ubl2.1/rules-documentation.json', JSON.stringify(rules), function (err) {
  if (err) throw err;
  console.log('rules done');
});
