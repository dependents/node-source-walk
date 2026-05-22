import { readFile } from 'node:fs/promises';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('traverse', () => {
  let srcFile;
  let walker;
  let ast;

  beforeAll(async() => {
    srcFile = await readFile(new URL('fixtures/srcFile.js', import.meta.url), 'utf8');
  });

  beforeEach(() => {
    walker = new Walker();
    ast = walker.parse(srcFile);
  });

  it('creates a parent reference for each node', () => {
    const callback = vi.fn();
    walker.walk(ast, callback);

    const firstNode = callback.mock.calls[0][0];
    const secondNode = callback.mock.calls[1][0];
    expect(secondNode.parent).toBe(firstNode);
  });

  it('skips non-object elements when traversing an array', () => {
    const callback = vi.fn();
    const node = { type: 'A' };
    walker.traverse([null, node], callback);
    expect(callback).toHaveBeenCalledExactlyOnceWith(node);
  });

  it('does nothing when called with a non-object non-array value', () => {
    const callback = vi.fn();
    walker.traverse(null, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
