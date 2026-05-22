import {
  describe,
  it,
  expect,
  beforeEach,
  vi
} from 'vitest';
import Walker from '../index.js';

describe('when given a different parser', () => {
  let parser;
  let walker;

  beforeEach(() => {
    parser = {
      parse: vi.fn()
    };
    walker = new Walker({ parser });
  });

  it('uses it during a parse', () => {
    walker.parse('1+1;');
    expect(parser.parse).toHaveBeenCalledOnce();
  });

  it('does not send it to the parser as an option', () => {
    walker.parse('1+1;');

    const parserOptions = parser.parse.mock.calls[0][1];
    expect(parserOptions.parser).toBeUndefined();
  });

  it('does not mutate the options object passed to the constructor', () => {
    const opts = {
      parser: {
        parse: vi.fn()
      }
    };

    new Walker(opts); // eslint-disable-line no-new
    expect('parser' in opts).toBe(true);
  });
});
