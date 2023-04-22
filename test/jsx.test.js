'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const jsx = suite('jsx');

jsx.before.each(context => {
  context.walker = new Walker();
});

jsx('parses', context => {
  const spy = sinon.spy();

  context.walker.walk('<jsx />', node => {
    if (node.type === 'JSXIdentifier') {
      spy();
      assert.is(node.name, 'jsx');
    }
  });

  assert.is(spy.callCount, 1);
});

jsx.run();
