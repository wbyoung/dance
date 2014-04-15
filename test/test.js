'use strict';

var dlx = require('..');
var expect = require('chai').expect;

describe('dance', function() {
  describe('solve()', function() {
    it('solves matrixes', function() {
      var matrix = [
        [1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 1],
        [0, 0, 1, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 1, 1],
        [0, 1, 0, 0, 0, 0, 1]
      ];
      expect(dlx.solve(matrix)).to.eql([[1, 3, 5]]);

    });
  });
});
