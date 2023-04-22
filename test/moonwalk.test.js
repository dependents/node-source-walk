'use strict';

const sinon = require('sinon');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const Walker = require('../index.js');

const moonwalk = suite('moonwalk');

moonwalk.before.each(context => {
  context.walker = new Walker();
});

moonwalk('throws if not given a valid object', context => {
  const cb = sinon.spy();
  assert.throws(() => {
    context.walker.moonwalk('yo', cb);
  }, Error, 'node must be an object');
});

moonwalk('visits the parent of the given node', context => {
  const parent = {};
  const child = {
    type: 'ExpressionStatement',
    parent
  };

  context.walker.moonwalk(child, node => {
    assert.equal(node, parent);
    context.walker.stopWalking();
  });
});

moonwalk('stops traversing upwards when there are no more parents', context => {
  const spy = sinon.spy();
  const parent = {};
  const child = {
    type: 'ExpressionStatement',
    parent
  };

  context.walker.moonwalk(child, spy);
  assert.is(spy.callCount, 1);
});

moonwalk('handles more than one level of nesting', context => {
  const spy = sinon.spy();
  const grandParent = {};
  const parent = { parent: grandParent };
  const child = {
    type: 'ExpressionStatement',
    parent
  };

  context.walker.moonwalk(child, spy);
  assert.is(spy.callCount, 2);
});

moonwalk('when given a node that does not have a parent does not continue', context => {
  const spy = sinon.spy();
  const child = {
    type: 'ExpressionStatement'
  };

  context.walker.moonwalk(child, spy);
  assert.not.ok(spy.called);
});

moonwalk('when told to stop walking does not continue', context => {
  const spy = sinon.spy();
  const grandParent = {};
  const parent = { parent: grandParent };
  const child = {
    type: 'ExpressionStatement',
    parent
  };

  context.walker.moonwalk(child, () => {
    spy();
    context.walker.stopWalking();
  });

  assert.is(spy.callCount, 1);
});

moonwalk('when the parent is a list of children calls the callback for each of the parent elements', context => {
  const spy = sinon.spy();
  const grandParent = {};
  const parent = [{
    type: 'ExpressionStatement'
  }];
  const child = {
    type: 'ExpressionStatement',
    parent
  };

  parent.parent = grandParent;
  context.walker.moonwalk(child, spy);
  assert.is(spy.callCount, 2);
});

moonwalk.run();
