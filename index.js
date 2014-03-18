var esprima = require('esprima');

module.exports = function () {
  // We use global state to stop the recursive
  // traversal of the AST
  this.shouldStop = false;
};

// Adapted from node-detective
function traverse (node, cb) {
  var that = this;

  if (this.shouldStop) return;

  if (Array.isArray(node)) {
    node.forEach(function (x) {
      if(x != null) {
        // Mark that the node has been visited
        x.parent = node;
        traverse.call(that, x, cb);
      }
    });

  } else if (node && typeof node === 'object') {
    cb(node);

    Object.keys(node).forEach(function (key) {
      // Avoid visited nodes
      if (key === 'parent' || ! node[key]) return;

      node[key].parent = node;
      traverse.call(that, node[key], cb);
    });
  }
}

// Executes the passed callback for every traversed node of
// the passed in src's ast
module.exports.prototype.walk = function (src, cb) {
  this.shouldStop = false;

  var ast = esprima.parse(src);

  traverse.call(this, ast, cb);
};

// Halts further traversal of the AST
module.exports.prototype.stopWalking = function () {
  this.shouldStop = true;
};