'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const differentParser = suite('when given a different parser');

differentParser.before.each(context => {
  context.parser = {
    parse: sinon.stub()
  };
  context.walker = new Walker({ parser: context.parser });
});

differentParser('uses it during a parse', context => {
  context.walker.parse('1+1;');
  assert.ok(context.parser.parse.called);
});

differentParser('does not send it to the parser as an option', context => {
  context.walker.parse('1+1;');

  const parserOptions = context.parser.parse.args[0][1];
  assert.type(parserOptions.parser, 'undefined');
});

differentParser.run();
