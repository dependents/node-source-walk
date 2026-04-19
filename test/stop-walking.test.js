'use strict';

const { readFile } = require('fs/promises');
const path = require('path');
const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const test = suite('stopWalking');

test.before.each(async context => {
  context.srcFile = await readFile(path.join(__dirname, '/fixtures/srcFile.js'), 'utf8');
});

test.before.each(context => {
  context.walker = new Walker();
  context.ast = context.walker.parse(context.srcFile);
});

test('halts further traversal of the AST', context => {
  const spy = sinon.spy();

  context.walker.walk(context.ast, () => {
    spy();
    context.walker.stopWalking();
  });

  assert.ok(spy.calledOnce);
});

test.run();
