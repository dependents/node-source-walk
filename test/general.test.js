import { readFile } from 'node:fs/promises';
import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest';
import Walker from '../index.js';

const noop = () => {};

describe('general', () => {
  let walker;

  beforeEach(() => {
    walker = new Walker();
  });

  it('does not fail on binary scripts with a hashbang', async() => {
    const src = await readFile(new URL('fixtures/hashbang.js', import.meta.url), 'utf8');

    expect(() => {
      walker.parse(src);
    }).not.toThrow();
  });

  it('parses es6 by default', () => {
    expect(() => {
      walker.walk('() => console.log("foo")', noop);
      walker.walk('import {foo} from "bar";', noop);
    }).not.toThrow();
  });

  it('does not throw on ES7 async functions', () => {
    expect(() => {
      walker.walk('async function foo() {}', noop);
    }).not.toThrow();
  });

  it('does not throw on dynamic imports', () => {
    expect(() => {
      walker.walk('import("foo").then(foo => foo());', noop);
    }).not.toThrow();
  });

  it('does not throw when hitting a decorator before an export', () => {
    expect(() => {
      walker.walk('@decorator\nexport class Foo {}', noop);
    }).not.toThrow();
  });
});
