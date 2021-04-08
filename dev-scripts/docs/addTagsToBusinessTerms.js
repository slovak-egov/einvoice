const fs = require('fs')

let businessTerms = require('./../../data/schemas/businessTerms/docs.json');
let invoiceTags = require('./../../data/schemas/ubl2.1/invoice-documentation.json');
let creditNoteTags = require('./../../data/schemas/ubl2.1/creditNote-documentation.json');

parseTag = (path, tag, fieldName) => {
  if (tag.businessTerms) {
    tag.businessTerms.forEach(bt => {
      if (!businessTerms[bt][fieldName]) businessTerms[bt][fieldName] = new Set();
      businessTerms[bt][fieldName].add([...path])
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
  Object.values(businessTerms).forEach(bt => delete bt[fieldName]);

  Object.entries(doc).forEach(([name, tag]) => parseTag([name], tag, fieldName));

  Object.values(businessTerms).forEach(bt => {
    if (bt[fieldName]) {
      bt[fieldName] = Array.from(bt[fieldName]);
    }
  });
}

parseDoc(invoiceTags, 'invoiceTags');
parseDoc(creditNoteTags, 'creditNoteTags');

fs.writeFile('./../../data/schemas/businessTerms/docs.json', JSON.stringify(businessTerms), function (err) {
  if (err) throw err;
  console.log('done');
});
