'use strict';

const { readFile } = require('fs').promises;
const path = require('path');
const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const walk = suite('walk');

walk.before(async context => {
  context.srcFile = await readFile(path.join(__dirname, '/fixtures/srcFile.js'), 'utf8');
});

walk.before.each(context => {
  context.walker = new Walker();
  context.ast = context.walker.parse(context.srcFile);
  context.parseSpy = sinon.stub(context.walker, 'parse');
  context.callback = sinon.spy();
});

walk.after.each(context => {
  context.parseSpy.restore();
  context.callback.resetHistory();
});

walk('parses the given source code', context => {
  context.walker.walk(context.srcFile, context.callback);
  assert.ok(context.parseSpy.called);
});

walk('calls the given callback for each node in the ast', context => {
  context.walker.walk(context.ast, context.callback);
  assert.ok(context.callback.called);
  const node = context.callback.getCall(0).args[0];
  assert.type(node, 'object');
});

walk('reuses a given AST instead of parsing again', context => {
  context.walker.walk(context.ast, context.callback);
  assert.not.ok(context.parseSpy.called);
  assert.ok(context.callback.called);
});

walk.run();
