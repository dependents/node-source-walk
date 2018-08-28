var assert = require('assert');
var Walker = require('../');
var fs = require('fs');
var sinon = require('sinon');

describe('node-source-walk', function() {
  var walker;
  var ast;
  var src;

  beforeEach(function() {
    walker = new Walker();
    src = fs.readFileSync(__dirname + '/example/srcFile.js', 'utf8');
    ast = walker.parse(src);
  });

  it('does not fail on binary scripts with a hashbang', function() {
    var walker = new Walker();
    var src = fs.readFileSync(__dirname + '/example/hashbang.js', 'utf8');

    assert.doesNotThrow(function() {
      var ast = walker.parse(src);
    });
  });

  it('parses es6 by default', function() {
    var walker = new Walker();
    assert.doesNotThrow(function() {
      walker.walk('() => console.log("foo")', function() {});
      walker.walk('import {foo} from "bar";', function() {});
    });
  });

  it('does not throw on ES7 async functions', function() {
    var walker = new Walker();
    assert.doesNotThrow(function() {
      walker.walk('async function foo() {}', function() {});
    });
  });

  it('does not throw on dynamic imports', function() {
    var walker = new Walker();
    assert.doesNotThrow(function() {
      walker.walk('import("foo").then(foo => foo());', function() {});
    });
  });

  describe('when given a different parser', function() {
    var walker;
    var parser;

    beforeEach(function() {
      parser = {
        parse: sinon.stub()
      };

      walker = new Walker({
        parser: parser
      });
    });

    it('uses it during a parse', function() {
      walker.parse('1+1;');

      assert.ok(parser.parse.called);
    });

    it('does not send it to the parser as an option', function() {
      walker.parse('1+1;');

      var parserOptions = parser.parse.args[0][1];
      assert.ok(parserOptions.parser === undefined);
    });
  });

  describe('walk', function() {
    var parseSpy;
    var cb;

    beforeEach(function() {
      parseSpy = sinon.stub(walker, 'parse');
      cb = sinon.spy();
    });

    afterEach(function() {
      parseSpy.restore();
      cb.resetHistory();
    });

    it('parses the given source code', function() {
      walker.walk(src, cb);

      assert(parseSpy.called);
    });

    it('calls the given callback for each node in the ast', function() {
      walker.walk(ast, cb);
      assert(cb.called);
      var node = cb.getCall(0).args[0];
      assert(typeof node === 'object');
    });

    it('reuses a given AST instead of parsing again', function() {
      walker.walk(ast, cb);

      assert.ok(!parseSpy.called);
      assert.ok(cb.called);
    });
  });

  describe('moonwalk', function() {
    it('throws if not given a valid object', function() {
      assert.throws(function() {
        walker.moonwalk('yo', cb);
      }, Error, 'node must be an object');
    });

    it('visits the parent of the given node', function() {
      var parent = {};
      var child = {
        type: 'ExpressionStatement',
        parent: parent
      };

      walker.moonwalk(child, function(node) {
        assert.deepEqual(node, parent);
        walker.stopWalking();
      });
    });

    it('stops traversing upwards when there are no more parents', function() {
      var spy = sinon.spy();

      var parent = {};
      var child = {
        type: 'ExpressionStatement',
        parent: parent
      };

      walker.moonwalk(child, spy);
      assert.equal(spy.callCount, 1);
    });

    it('handles more than one level of nesting', function() {
      var spy = sinon.spy();
      var grandParent = {};
      var parent = {
        parent: grandParent
      };
      var child = {
        type: 'ExpressionStatement',
        parent: parent
      };

      walker.moonwalk(child, spy);

      assert.equal(spy.callCount, 2);
    });

    describe('when given a node that does not have a parent', function() {
      it('does not continue', function() {
        var spy = sinon.spy();
        var child = {
          type: 'ExpressionStatement'
        };

        walker.moonwalk(child, spy);
        assert.ok(!spy.called);
      });
    });

    describe('when told to stop walking', function() {
      it('does not continue', function() {
        var spy = sinon.spy();
        var grandParent = {};
        var parent = {
          parent: grandParent
        };
        var child = {
          type: 'ExpressionStatement',
          parent: parent
        };

        walker.moonwalk(child, function() {
          spy();
          walker.stopWalking();
        });

        assert.equal(spy.callCount, 1);
      });
    });

    describe('when the parent is a list of children', function() {
      it('calls the callback for each of the parent elements', function() {
        var spy = sinon.spy();
        var grandParent = {};
        var parent = [
          {
            type: 'ExpressionStatement'
          }
        ];
        parent.parent = grandParent;

        var child = {
          type: 'ExpressionStatement',
          parent: parent
        };

        walker.moonwalk(child, spy);

        assert.equal(spy.callCount, 2);
      });
    });
  });

  describe('traverse', function() {
    it('creates a parent reference for each node', function() {
      var cb = sinon.spy();
      walker.walk(ast, cb);
      var firstNode = cb.getCall(0).args[0];
      var secondNode = cb.getCall(1).args[0];
      assert(secondNode.parent === firstNode);
    });
  });

  describe('stopWalking', function() {
    it('halts further traversal of the AST', function() {
      var spy = sinon.spy();

      walker.walk(ast, function() {
        spy();
        walker.stopWalking();
      });

      assert(spy.calledOnce);
    });
  });

  describe('jsx', function() {
    var spy;
    var walker;

    beforeEach(function() {
      spy = sinon.spy();
      walker = new Walker();
    });

    it('parses', function() {
      walker.walk('<jsx />', function(node) {
        if (node.type === 'JSXIdentifier') {
          spy();
          assert.equal(node.name, 'jsx');
        }
      });
      assert.equal(spy.callCount, 1);
    });
  });

  describe('flow type imports', function() {
    it('parses', function() {
      assert.doesNotThrow(function() {
        walker.parse('import { Something, type SomethingElse } from "someModule";');
      });
    });
  });

  describe('parse', function() {
    describe('when no parser options are supplied', function() {
      it('uses the defaults', function() {
        var src = '1+1;';
        var stub = sinon.stub(walker.parser, 'parse');

        walker.parse(src);
        assert.ok(stub.calledWith(src, walker.options));

        stub.restore();
      });
    });
  });
});
