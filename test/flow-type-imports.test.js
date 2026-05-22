import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest';
import Walker from '../index.js';

describe('flow type imports', () => {
  let walker;

  beforeEach(() => {
    walker = new Walker();
  });

  it('parses', () => {
    expect(() => {
      walker.parse('import { Something, type SomethingElse } from "someModule";');
    }).not.toThrow();
  });
});
