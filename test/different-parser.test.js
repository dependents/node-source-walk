import sinon from 'sinon';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Walker from '../index.js';

const test = suite('when given a different parser');

test.before.each(context => {
  context.parser = {
    parse: sinon.stub()
  };
  context.walker = new Walker({ parser: context.parser });
});

test('uses it during a parse', context => {
  context.walker.parse('1+1;');
  assert.ok(context.parser.parse.called);
});

test('does not send it to the parser as an option', context => {
  context.walker.parse('1+1;');

  const parserOptions = context.parser.parse.args[0][1];
  assert.type(parserOptions.parser, 'undefined');
});

test('does not mutate the options object passed to the constructor', () => {
  const opts = {
    parser: {
      parse: sinon.stub()
    }
  };

  new Walker(opts); // eslint-disable-line no-new
  assert.ok('parser' in opts, 'parser key was deleted from caller\'s object');
});

test.run();
