import { readFile } from 'node:fs/promises';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('walk', () => {
  let srcFile;
  let walker;
  let ast;
  let parseSpy;
  let callback;

  beforeAll(async() => {
    srcFile = await readFile(new URL('fixtures/srcFile.js', import.meta.url), 'utf8');
  });

  beforeEach(() => {
    walker = new Walker();
    ast = walker.parse(srcFile);
    parseSpy = vi.spyOn(walker, 'parse');
    callback = vi.fn();
  });

  afterEach(() => {
    parseSpy.mockRestore();
    callback.mockReset();
  });

  it('parses the given source code', () => {
    walker.walk(srcFile, callback);
    expect(parseSpy).toHaveBeenCalledOnce();
  });

  it('calls the given callback for each node in the ast', () => {
    walker.walk(ast, callback);
    expect(callback).toHaveBeenCalled();
    const node = callback.mock.calls[0][0];
    expect(node).toBeTypeOf('object');
  });

  it('reuses a given AST instead of parsing again', () => {
    walker.walk(ast, callback);
    expect(parseSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });
});
