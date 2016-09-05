var babylon = require('babylon');

/**
 * @param  {Object} options - Options to configure parser
 * @param  {Object} options.parser - An object with a parse method that returns an AST
 */
module.exports = function(options) {
  options = options || {};
  this.parser = options.parser || babylon;

  if (options.parser) {
    // We don't want to send that down to the actual parser
    delete options.parser;
  }

  this.options = options;
  this.options.plugins = options.plugins || [
    'jsx',
    'flow',
    'asyncFunctions',
    'classConstructorCall',
    'doExpressions',
    'trailingFunctionCommas',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'exportExtensions',
    'exponentiationOperator',
    'asyncGenerators',
    'functionBind',
    'functionSent'
  ];

  this.options.allowHashBang = options.allowHashBang || true;
  this.options.sourceType = options.sourceType || 'module';

  // We use global state to stop the recursive traversal of the AST
  this.shouldStop = false;
};

/**
 * @param  {String} src
 * @param  {Object} [options] - Parser options
 * @return {Object} The AST of the given src
 */
module.exports.prototype.parse = function(src, options) {
  options = options || this.options;

  // Keep around for consumers of parse that supply their own options
  if (typeof options.allowHashBang === 'undefined') {
    options.allowHashBang = true;
  }

  return this.parser.parse(src, options);
};

/**
 * Adapted from substack/node-detective
 * Executes cb on a non-array AST node
 */
module.exports.prototype.traverse = function(node, cb) {
  if (this.shouldStop) { return; }

  if (Array.isArray(node)) {
    for (var i = 0, l = node.length; i < l; i++) {
      var x = node[i];
      if (x !== null) {
        // Mark that the node has been visited
        x.parent = node;
        this.traverse(x, cb);
      }
    }

  } else if (node && typeof node === 'object') {
    cb(node);

    for (var key in node) {
      // Avoid visited nodes
      if (key === 'parent' || !node[key]) { continue; }

      node[key].parent = node;
      this.traverse(node[key], cb);
    }
  }
};

/**
 * Executes the passed callback for every traversed node of
 * the passed in src's ast
 *
 * @param {String|Object} src - The source code or AST to traverse
 * @param {Function} cb - Called for every node
 */
module.exports.prototype.walk = function(src, cb) {
  this.shouldStop = false;

  var ast = typeof src === 'object' ? src : this.parse(src);

  this.traverse(ast, cb);
};

module.exports.prototype.moonwalk = function(node, cb) {
  this.shouldStop = false;

  if (typeof node !== 'object') {
    throw new Error('node must be an object');
  }

  reverseTraverse.call(this, node, cb);
};

function reverseTraverse(node, cb) {
  if (this.shouldStop || !node.parent) { return; }

  if (node.parent instanceof Array) {
    for (var i = 0, l = node.parent.length; i < l; i++) {
      cb(node.parent[i]);
    }
  } else {
    cb(node.parent);
  }

  reverseTraverse.call(this, node.parent, cb);
}

/**
 * Halts further traversal of the AST
 */
module.exports.prototype.stopWalking = function() {
  this.shouldStop = true;
};
