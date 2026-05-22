import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('moonwalk', () => {
  let walker;

  beforeEach(() => {
    walker = new Walker();
  });

  it('throws if not given a valid object', () => {
    const callback = vi.fn();
    expect(() => {
      walker.moonwalk('yo', callback);
    }).toThrow(new Error('node must be an object'));
  });

  it('visits the parent of the given node', () => {
    const parent = {};
    const child = {
      type: 'ExpressionStatement',
      parent
    };

    walker.moonwalk(child, node => {
      expect(node).toBe(parent);
      walker.stopWalking();
    });
  });

  it('stops traversing upwards when there are no more parents', () => {
    const spy = vi.fn();
    const parent = {};
    const child = {
      type: 'ExpressionStatement',
      parent
    };

    walker.moonwalk(child, spy);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('handles more than one level of nesting', () => {
    const spy = vi.fn();
    const grandParent = {};
    const parent = { parent: grandParent };
    const child = {
      type: 'ExpressionStatement',
      parent
    };

    walker.moonwalk(child, spy);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('when given a node that does not have a parent does not continue', () => {
    const spy = vi.fn();
    const child = {
      type: 'ExpressionStatement'
    };

    walker.moonwalk(child, spy);
    expect(spy).not.toHaveBeenCalled();
  });

  it('when told to stop walking does not continue', () => {
    const spy = vi.fn();
    const grandParent = {};
    const parent = { parent: grandParent };
    const child = {
      type: 'ExpressionStatement',
      parent
    };

    walker.moonwalk(child, () => {
      spy();
      walker.stopWalking();
    });

    expect(spy).toHaveBeenCalledOnce();
  });

  it('when the parent is a list of children calls the callback for each of the parent elements', () => {
    const spy = vi.fn();
    const grandParent = {};
    const parent = [{
      type: 'ExpressionStatement'
    }];
    const child = {
      type: 'ExpressionStatement',
      parent
    };

    parent.parent = grandParent;
    walker.moonwalk(child, spy);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('stops iterating array-parent siblings when walking is stopped', () => {
    const spy = vi.fn();
    const sibling = { type: 'ExpressionStatement' };
    const child = { type: 'ExpressionStatement' };
    const arrayParent = [sibling, child];
    child.parent = arrayParent;

    walker.moonwalk(child, () => {
      spy();
      walker.stopWalking();
    });

    expect(spy).toHaveBeenCalledOnce();
  });
});
