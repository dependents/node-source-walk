import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('jsx', () => {
  let walker;

  beforeEach(() => {
    walker = new Walker();
  });

  it('parses', () => {
    const spy = vi.fn();

    walker.walk('<jsx />', node => {
      if (node.type === 'JSXIdentifier') {
        spy();
        expect(node.name).toBe('jsx');
      }
    });

    expect(spy).toHaveBeenCalledOnce();
  });
});
