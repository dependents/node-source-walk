'use strict';

const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const flowImports = suite('flow type imports');

flowImports.before.each(context => {
  context.walker = new Walker();
});

flowImports('parses', context => {
  assert.not.throws(() => {
    context.walker.parse('import { Something, type SomethingElse } from "someModule";');
  });
});

flowImports.run();
