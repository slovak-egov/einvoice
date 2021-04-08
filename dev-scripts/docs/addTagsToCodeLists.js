const fs = require('fs');

let codeLists = require('./../../data/codeLists.json');
let invoiceTags = require('./../../data/schemas/ubl2.1/invoice-documentation.json');
let creditNoteTags = require('./../../data/schemas/ubl2.1/creditNote-documentation.json');

parseTag = (path, tag, fieldName) => {
  if (tag.codeLists) {
    tag.codeLists.forEach(codeList => {
      if (!codeLists[codeList][fieldName]) codeLists[codeList][fieldName] = new Set();
      codeLists[codeList][fieldName].add([...path])
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
  Object.values(codeLists).forEach(codeList => delete codeList[fieldName]);

  Object.entries(doc).forEach(([name, tag]) => parseTag([name], tag, fieldName));

  Object.values(codeLists).forEach(codeList => {
    if (codeList[fieldName]) {
      codeList[fieldName] = Array.from(codeList[fieldName]);
    }
  });
}

parseDoc(invoiceTags, 'invoiceTags');
parseDoc(creditNoteTags, 'creditNoteTags');

fs.writeFile('./../../data/codeLists.json', JSON.stringify(codeLists), function (err) {
  if (err) throw err;
  console.log('done');
});
