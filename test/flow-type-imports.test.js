'use strict';

const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

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
