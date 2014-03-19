var Walker = require('../'),
    fs = require('fs');

var src = fs.readFileSync('./srcFile.js').toString(),
    walker = new Walker();

walker.walk(src, function (node) {
  console.log(node);
  walker.traverse(node, function (node) {
    console.log('Meta shit: ', node);
  });
});

