import sinon from 'sinon';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Walker from '../index.js';

const test = suite('parse');

test.before.each(context => {
  context.parser = {
    parse: sinon.stub()
  };
  context.walker = new Walker({ parser: context.parser });
});

test('when no parser options are supplied uses the defaults', context => {
  const src = '1+1;';

  context.walker.parse(src);
  assert.ok(context.parser.parse.calledWith(src, context.walker.options));
});

test('does not mutate caller options when allowHashBang is absent', context => {
  const options = { sourceType: 'script' };
  context.walker.parse('1+1;', options);
  assert.type(options.allowHashBang, 'undefined');
});

test.run();
