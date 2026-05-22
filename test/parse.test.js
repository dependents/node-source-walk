import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('parse', () => {
  let parser;
  let walker;

  beforeEach(() => {
    parser = {
      parse: vi.fn()
    };
    walker = new Walker({ parser });
  });

  it('when no parser options are supplied uses the defaults', () => {
    const src = '1+1;';

    walker.parse(src);
    expect(parser.parse).toHaveBeenCalledExactlyOnceWith(src, walker.options);
  });

  it('does not mutate caller options when allowHashBang is absent', () => {
    const options = { sourceType: 'script' };
    walker.parse('1+1;', options);
    expect(options.allowHashBang).toBeUndefined();
  });
});
