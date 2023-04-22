'use strict';

const fs = require('fs').promises;
const path = require('path');
const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const traverse = suite('traverse');

traverse.before(async context => {
  context.srcFile = await fs.readFile(path.join(__dirname, '/fixtures/srcFile.js'), 'utf8');
});

traverse.before.each(context => {
  context.walker = new Walker();
  context.ast = context.walker.parse(context.srcFile);
});

traverse('creates a parent reference for each node', context => {
  const cb = sinon.spy();
  context.walker.walk(context.ast, cb);
  const firstNode = cb.getCall(0).args[0];
  const secondNode = cb.getCall(1).args[0];
  assert.is(secondNode.parent, firstNode);
});

traverse.run();
