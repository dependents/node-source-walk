import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Walker from '../index.js';

const test = suite('flow type imports');

test.before.each(context => {
  context.walker = new Walker();
});

test('parses', context => {
  assert.not.throws(() => {
    context.walker.parse('import { Something, type SomethingElse } from "someModule";');
  });
});

test.run();
