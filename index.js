var babylon = require('babylon');

/**
 * @param  {Object} options - Options to configure parser
 */
module.exports = function(options) {
  this.options = options || {};
  this.options.plugins = this.options.plugins || [
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

  this.options.sourceType = this.options.sourceType || 'module';

  // We use global state to stop the recursive traversal of the AST
  this.shouldStop = false;
};

/**
 * @param  {String} src
 * @param  {Object} [options] - Parser options
 * @return {Object} The AST of the given src
 */
module.exports.prototype.parse = function(src, options) {
  options = options || {};

  if (typeof options.allowHashBang === 'undefined') {
    options.allowHashBang = true;
  }

  return babylon.parse(src, options);
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

  var ast = typeof src === 'object' ?
            src :
            this.parse(src, this.options);

  this.traverse(ast, cb);
};

/**
 * Halts further traversal of the AST
 */
module.exports.prototype.stopWalking = function() {
  this.shouldStop = true;
};
