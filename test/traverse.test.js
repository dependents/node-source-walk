import { readFile } from 'node:fs/promises';
import sinon from 'sinon';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Walker from '../index.js';

const test = suite('traverse');

test.before(async context => {
  context.srcFile = await readFile(new URL('fixtures/srcFile.js', import.meta.url), 'utf8');
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
