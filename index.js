'use strict';

/**
 * Implementation of Donald Knuth's Dancing Links Algorithm.
 *
 * Since the algorithm is well defined by Knuth in his paper, this code is
 * somewhat sparsely documented. For more information, refer to the original
 * implementation by Knuth or his paper.
 *
 * http://www-cs-faculty.stanford.edu/~uno/papers/dancing-color.ps.gz
 * http://www-cs-faculty.stanford.edu/~uno/programs/dance.w
 */

/**
 * @typedef {object} node
 *
 * Node
 *
 * A node is an entry that allows easy creation of a sparse matrix representing
 * the input matrix to the exact cover problem and allows faster and easier
 * manipulation while reducing the problem set.
 *
 * @property {node} up - Node above this node.
 * @property {node} down - Node below this node.
 * @property {node} left - Node to the left of this node.
 * @property {node} right - Node to the right of this node.
 * @property {header} header - Column header for this node.
 * @property {string} rowNumber - The row number from the input matrix.
 */

/**
 * @typedef {object} header
 *
 * Column header
 *
 * The column header contains information about a column of nodes. It also
 * contains pointers to the next and previous header columns.
 *
 * @property {node} head - A header node through which you can reach the column
 * of nodes.
 * @property {number} length - The number of nodes in this column (excluding
 * the header).
 * @property {header} prev - The previous column header.
 * @property {header} next - The next column header.
 */

/**
 * Iterate through each node that follows this node in the given direction. The
 * node that's passed to the function is intentionally skipped.
 *
 * @param {node} node - The node from which to start.
 * @param {string} direction - The direction to iterate.
 * @param {function} fn - The callback to call for each iteration. It takes a
 * single argument, the node.
 */
var eachNode = function(node, direction, fn) {
  for (var n = node[direction]; n !== node; n = n[direction]) {
    fn(n);
  }
};

/**
 * Iterate through each header that follows this header in the given direction.
 * The header that's passed to the function is intentionally skipped.
 *
 * @param {header} header - The header from which to start.
 * @param {string} direction - The direction to iterate.
 * @param {function} fn - The callback to call for each iteration. It takes a
 * single argument, the header.
 */
var eachHeader = function(header, direction, fn) {
  for (var h = header[direction]; h !== header; h = h[direction]) {
    fn(h);
  }
};

/**
 * Cover a column, removing it from the data set.
 *
 * @param {header} column - The column to cover.
 */
var cover = function(column) {
  column.next.prev = column.prev;
  column.prev.next = column.next;

  eachNode(column.head, 'down', function(rowNode) {
    eachNode(rowNode, 'right', function(colNode) {
      colNode.up.down = colNode.down;
      colNode.down.up = colNode.up;
      colNode.header.length -= 1;
    });
  });
};

/**
 * Uncover a column, re-adding it to the data set.
 *
 * @param {header} column - The column to uncover.
 */
var uncover = function(column) {
  eachNode(column.head, 'up', function(rowNode) {
    eachNode(rowNode, 'left', function(colNode) {
      colNode.header.length += 1;
      colNode.up.down = colNode;
      colNode.down.up = colNode;
    });
  });

  column.next.prev = column;
  column.prev.next = column;
};

/**
 * Recursively narrow down the data set of the problem identifying solutions by
 * covering and uncovering columns.
 *
 * @param {column} header
 * @param {object} options - Options
 *   {number} [maxSolutions=0]
 * @param {object} [state] - Current state of the algorithm
 *   {number} k
 *   {array} solutions
 *   {array} partials
 */
var recurse = function(root, options) {
  var opts = options || {};
  var max = opts.maxSolutions || 0;
  var state = arguments[2] || {};
  var k = state.k || 0;
  var solutions = state.solutions || [];
  var partials = state.partials || [];

  // return early if we found as many solutions as required
  if (max && solutions.length === max) {
    return solutions;
  }

  if (root.next === root) {
    solutions.push(partials.slice(0)); // found a solution
  }
  else {
    // find the best column header to work with based on length
    var best;
    var smallest;
    eachHeader(root, 'next', function(h) {
      if (!best || h.length < smallest) {
        best = h;
        smallest = h.length;
      }
    });

    if (best && best.length > 0) {
      cover(best);
      eachNode(best.head, 'down', function(rowNode) {
        partials[k] = rowNode.rowNumber;
        eachNode(rowNode, 'right', function(colNode) {
          cover(colNode.header);
        });

        recurse(root, opts, {
          k: k + 1,
          solutions: solutions,
          partials: partials
        });

        eachNode(rowNode, 'left', function(colNode) {
          uncover(colNode.header);
        });
      });
      uncover(best);
    }
  }

  return solutions;
};

/**
 * Create a node linked to the provided neighboring elements.
 *
 * @param {object} options
 *   {header} column - The column this node is part of.
 *   {node} left - The node to the left of the node to be created.
 *   {node} up - The node above the node to be created.
 * @returns {node}
 */
var createNode = function(options) {
  var node = {};

  var opts = options || {};
  var column = opts.column;
  var left = opts.left || (node.left = node.right = node);
  var up = opts.up || (node.up = node.down = node);

  node.header = column;
  node.left = left;
  node.right = left.right;
  left.right.left = node;
  left.right = node;
  node.up = up;
  node.down = up.down;
  up.down.up = node;
  up.down = node;

  return node;
};

/**
 * Solve an exact cover problem.
 *
 * @param {array} matrix - A two dimensional array representation of the exact
 * cover problem to solve. For more information, on this representation, see
 * the Wikipedia page on exact cover problems:
 * http://en.wikipedia.org/wiki/Exact_cover#Matrix_and_hypergraph_representations
 * @param {object} options - Options
 *   {number} [maxSolutions=0]
 * @returns {array} - An array of solutions. Each solution in the array is
 * itself an array containing the row numbers from the input matrix that create
 * the solution.
 */
var solve = function(matrix, options) {
  var columns = [];

  var prev = null;
  for (var i = 0; i < matrix[0].length; i += 1) {
    var column = {};
    if (!prev) { prev = column.prev = column.next = column; }
    column.length = 0;
    column.prev = prev;
    column.next = prev.next;
    column.head = createNode({
      column: column,
      left: prev.head
    });
    prev.next.prev = column;
    prev.next = column;
    prev = column;
    columns.push(column);
  }

  matrix.forEach(function(row, rowIndex) {
    var left = null;
    row.forEach(function(value, col) {
      if (value) {
        var column = columns[col];
        var node = createNode({
          column: column,
          left: left,
          up: column.head.up
        });
        node.rowNumber = rowIndex;
        column.length += 1;
        left = node;
      }
    });
  });

  // create the root, a header column, as required by the algorithm
  var root = {};
  root.prev = columns[0].prev;
  root.next = columns[0];
  columns[0].prev.next = root;
  columns[0].prev = root;

  return recurse(root, options);
};

exports.solve = solve;
