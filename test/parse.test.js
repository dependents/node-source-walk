'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const parse = suite('parse');

parse.before.each(context => {
  context.walker = new Walker();
});

parse('when no parser options are supplied uses the defaults', context => {
  const src = '1+1;';
  const stub = sinon.stub(context.walker.parser, 'parse');

  context.walker.parse(src);
  assert.ok(stub.calledWith(src, context.walker.options));

  stub.restore();
});

parse.run();
