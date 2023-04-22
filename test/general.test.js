'use strict';

const fs = require('fs').promises;
const path = require('path');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const noop = () => {};

const general = suite('general');

general.before.each(context => {
  context.walker = new Walker();
});

general('does not fail on binary scripts with a hashbang', async context => {
  const src = await fs.readFile(path.join(__dirname, '/fixtures/hashbang.js'), 'utf8');

  assert.not.throws(() => {
    context.walker.parse(src);
  });
});

general('parses es6 by default', context => {
  assert.not.throws(() => {
    context.walker.walk('() => console.log("foo")', noop);
    context.walker.walk('import {foo} from "bar";', noop);
  });
});

general('does not throw on ES7 async functions', context => {
  assert.not.throws(() => {
    context.walker.walk('async function foo() {}', noop);
  });
});

general('does not throw on dynamic imports', context => {
  assert.not.throws(() => {
    context.walker.walk('import("foo").then(foo => foo());', noop);
  });
});

general('does not throw when hitting a decorator before an export', context => {
  assert.not.throws(() => {
    context.walker.walk('@decorator\nexport class Foo {}', noop);
  });
});

general.run();
