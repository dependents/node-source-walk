import { readFile } from 'node:fs/promises';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('stopWalking', () => {
  let walker;
  let ast;

  beforeEach(async() => {
    const srcFile = await readFile(new URL('fixtures/srcFile.js', import.meta.url), 'utf8');
    walker = new Walker();
    ast = walker.parse(srcFile);
  });

  it('halts further traversal of the AST', () => {
    const spy = vi.fn();

    walker.walk(ast, () => {
      spy();
      walker.stopWalking();
    });

    expect(spy).toHaveBeenCalledOnce();
  });

  it('stops visiting array siblings when walking is stopped inside one', () => {
    const visited = [];

    walker.walk('foo; bar;', node => {
      if (node.type === 'ExpressionStatement') {
        visited.push(node);
        walker.stopWalking();
      }
    });

    expect(visited).toHaveLength(1);
  });

  it('stops visiting object property children when walking is stopped inside one', () => {
    const visited = [];

    walker.walk('a + b', node => {
      if (node.type === 'Identifier') {
        visited.push(node.name);
        walker.stopWalking();
      }
    });

    expect(visited).toStrictEqual(['a']);
  });
});
