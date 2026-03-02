'use strict';

const { readFile } = require('node:fs/promises');
const path = require('node:path');
const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const test = suite('walk');

test.before(async context => {
  context.srcFile = await readFile(path.join(__dirname, '/fixtures/srcFile.js'), 'utf8');
});

test.before.each(context => {
  context.walker = new Walker();
  context.ast = context.walker.parse(context.srcFile);
  context.parseSpy = sinon.stub(context.walker, 'parse');
  context.callback = sinon.spy();
});

test.after.each(context => {
  context.parseSpy.restore();
  context.callback.resetHistory();
});

test('parses the given source code', context => {
  context.walker.walk(context.srcFile, context.callback);
  assert.ok(context.parseSpy.called);
});

test('calls the given callback for each node in the ast', context => {
  context.walker.walk(context.ast, context.callback);
  assert.ok(context.callback.called);
  const node = context.callback.getCall(0).args[0];
  assert.type(node, 'object');
});

test('reuses a given AST instead of parsing again', context => {
  context.walker.walk(context.ast, context.callback);
  assert.not.ok(context.parseSpy.called);
  assert.ok(context.callback.called);
});

test.run();
