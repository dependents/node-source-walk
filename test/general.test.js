import { readFile } from 'node:fs/promises';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Walker from '../index.js';

const noop = () => {};

const test = suite('general');

test.before.each(context => {
  context.walker = new Walker();
});

test('does not fail on binary scripts with a hashbang', async context => {
  const src = await readFile(new URL('fixtures/hashbang.js', import.meta.url), 'utf8');

  assert.not.throws(() => {
    context.walker.parse(src);
  });
});

test('parses es6 by default', context => {
  assert.not.throws(() => {
    context.walker.walk('() => console.log("foo")', noop);
    context.walker.walk('import {foo} from "bar";', noop);
  });
});

test('does not throw on ES7 async functions', context => {
  assert.not.throws(() => {
    context.walker.walk('async function foo() {}', noop);
  });
});

test('does not throw on dynamic imports', context => {
  assert.not.throws(() => {
    context.walker.walk('import("foo").then(foo => foo());', noop);
  });
});

test('does not throw when hitting a decorator before an export', context => {
  assert.not.throws(() => {
    context.walker.walk('@decorator\nexport class Foo {}', noop);
  });
});

test.run();
