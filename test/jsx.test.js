'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const test = suite('jsx');

test.before.each(context => {
  context.walker = new Walker();
});

test('parses', context => {
  const spy = sinon.spy();

  context.walker.walk('<jsx />', node => {
    if (node.type === 'JSXIdentifier') {
      spy();
      assert.is(node.name, 'jsx');
    }
  });

  assert.is(spy.callCount, 1);
});

test.run();
