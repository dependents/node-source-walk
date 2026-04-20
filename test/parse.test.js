'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const test = suite('parse');

test.before.each(context => {
  context.walker = new Walker();
});

test('when no parser options are supplied uses the defaults', context => {
  const src = '1+1;';
  const stub = sinon.stub(context.walker.parser, 'parse');

  context.walker.parse(src);
  assert.ok(stub.calledWith(src, context.walker.options));

  stub.restore();
});

test('does not mutate caller options when allowHashBang is absent', context => {
  const options = { sourceType: 'script' };
  context.walker.parse('1+1;', options);
  assert.type(options.allowHashBang, 'undefined');
});

test.run();
