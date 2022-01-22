/* eslint-env mocha */

'use strict';

// TODO switch to assert.strict
const assert = require('assert');
const fs = require('fs');
const sinon = require('sinon');
const Walker = require('../index.js');

const noop = () => {};

describe('node-source-walk', () => {
  let walker;
  let ast;
  let srcFile;

  beforeEach(() => {
    walker = new Walker();
    srcFile = fs.readFileSync(`${__dirname}/example/srcFile.js`, 'utf8');
    ast = walker.parse(srcFile);
  });

  describe('general', () => {
    it('does not fail on binary scripts with a hashbang', () => {
      const src = fs.readFileSync(`${__dirname}/example/hashbang.js`, 'utf8');

      assert.doesNotThrow(() => {
        walker.parse(src);
      });
    });

    it('parses es6 by default', () => {
      assert.doesNotThrow(() => {
        walker.walk('() => console.log("foo")', noop);
        walker.walk('import {foo} from "bar";', noop);
      });
    });

    it('does not throw on ES7 async functions', () => {
      assert.doesNotThrow(() => {
        walker.walk('async function foo() {}', noop);
      });
    });

    it('does not throw on dynamic imports', () => {
      assert.doesNotThrow(() => {
        walker.walk('import("foo").then(foo => foo());', noop);
      });
    });

    it('does not throw when hitting a decorator before an export', () => {
      assert.doesNotThrow(() => {
        walker.walk('@decorator\nexport class Foo {}', noop);
      });
    });
  });

  describe('when given a different parser', () => {
    let parser;

    beforeEach(() => {
      parser = {
        parse: sinon.stub()
      };

      walker = new Walker({ parser });
    });

    it('uses it during a parse', () => {
      walker.parse('1+1;');
      assert.ok(parser.parse.called);
    });

    it('does not send it to the parser as an option', () => {
      walker.parse('1+1;');

      const parserOptions = parser.parse.args[0][1];
      assert.equal(typeof parserOptions.parser, 'undefined');
    });
  });

  describe('walk', () => {
    let parseSpy;
    let cb;

    beforeEach(() => {
      parseSpy = sinon.stub(walker, 'parse');
      cb = sinon.spy();
    });

    afterEach(() => {
      parseSpy.restore();
      cb.resetHistory();
    });

    it('parses the given source code', () => {
      walker.walk(srcFile, cb);
      assert.ok(parseSpy.called);
    });

    it('calls the given callback for each node in the ast', () => {
      walker.walk(ast, cb);
      assert.ok(cb.called);
      const node = cb.getCall(0).args[0];
      assert.equal(typeof node, 'object');
    });

    it('reuses a given AST instead of parsing again', () => {
      walker.walk(ast, cb);
      assert.ok(!parseSpy.called);
      assert.ok(cb.called);
    });
  });

  describe('moonwalk', () => {
    it('throws if not given a valid object', () => {
      const cb = sinon.spy();
      assert.throws(() => {
        walker.moonwalk('yo', cb);
      }, Error, 'node must be an object');
    });

    it('visits the parent of the given node', () => {
      const parent = {};
      const child = {
        type: 'ExpressionStatement',
        parent
      };

      walker.moonwalk(child, node => {
        assert.deepEqual(node, parent);
        walker.stopWalking();
      });
    });

    it('stops traversing upwards when there are no more parents', () => {
      const spy = sinon.spy();
      const parent = {};
      const child = {
        type: 'ExpressionStatement',
        parent
      };

      walker.moonwalk(child, spy);
      assert.equal(spy.callCount, 1);
    });

    it('handles more than one level of nesting', () => {
      const spy = sinon.spy();
      const grandParent = {};
      const parent = { parent: grandParent };
      const child = {
        type: 'ExpressionStatement',
        parent
      };

      walker.moonwalk(child, spy);
      assert.equal(spy.callCount, 2);
    });

    describe('when given a node that does not have a parent', () => {
      it('does not continue', () => {
        const spy = sinon.spy();
        const child = {
          type: 'ExpressionStatement'
        };

        walker.moonwalk(child, spy);
        assert.ok(!spy.called);
      });
    });

    describe('when told to stop walking', () => {
      it('does not continue', () => {
        const spy = sinon.spy();
        const grandParent = {};
        const parent = { parent: grandParent };
        const child = {
          type: 'ExpressionStatement',
          parent
        };

        walker.moonwalk(child, () => {
          spy();
          walker.stopWalking();
        });

        assert.equal(spy.callCount, 1);
      });
    });

    describe('when the parent is a list of children', () => {
      it('calls the callback for each of the parent elements', () => {
        const spy = sinon.spy();
        const grandParent = {};
        const parent = [{
          type: 'ExpressionStatement'
        }];
        const child = {
          type: 'ExpressionStatement',
          parent
        };

        parent.parent = grandParent;
        walker.moonwalk(child, spy);
        assert.equal(spy.callCount, 2);
      });
    });
  });

  describe('traverse', () => {
    it('creates a parent reference for each node', () => {
      const cb = sinon.spy();
      walker.walk(ast, cb);
      const firstNode = cb.getCall(0).args[0];
      const secondNode = cb.getCall(1).args[0];
      assert.equal(secondNode.parent, firstNode);
    });
  });

  describe('stopWalking', () => {
    it('halts further traversal of the AST', () => {
      const spy = sinon.spy();

      walker.walk(ast, () => {
        spy();
        walker.stopWalking();
      });

      assert.ok(spy.calledOnce);
    });
  });

  describe('jsx', () => {
    it('parses', () => {
      const spy = sinon.spy();

      walker.walk('<jsx />', node => {
        if (node.type === 'JSXIdentifier') {
          spy();
          assert.equal(node.name, 'jsx');
        }
      });

      assert.equal(spy.callCount, 1);
    });
  });

  describe('flow type imports', () => {
    it('parses', () => {
      assert.doesNotThrow(() => {
        walker.parse('import { Something, type SomethingElse } from "someModule";');
      });
    });
  });

  describe('parse', () => {
    describe('when no parser options are supplied', () => {
      it('uses the defaults', () => {
        const src = '1+1;';
        const stub = sinon.stub(walker.parser, 'parse');

        walker.parse(src);
        assert.ok(stub.calledWith(src, walker.options));

        stub.restore();
      });
    });
  });
});
