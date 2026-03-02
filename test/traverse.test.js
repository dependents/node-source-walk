'use strict';

const { readFile } = require('node:fs/promises');
const path = require('node:path');
const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const test = suite('traverse');

test.before(async context => {
  context.srcFile = await readFile(path.join(__dirname, '/fixtures/srcFile.js'), 'utf8');
});

test.before.each(context => {
  context.walker = new Walker();
  context.ast = context.walker.parse(context.srcFile);
});

test('creates a parent reference for each node', context => {
  const callback = sinon.spy();
  context.walker.walk(context.ast, callback);
  const firstNode = callback.getCall(0).args[0];
  const secondNode = callback.getCall(1).args[0];
  assert.is(secondNode.parent, firstNode);
});

test.run();
