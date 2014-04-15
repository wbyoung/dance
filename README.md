# Dancing Links Implementation

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Dependencies][david-image]][david-url]

An implementation of Donald Knuth's [Dancing Links Algorithm][knuth-dancing]
to solve [exact cover][exact-cover] problems.

```javascript
var dlx = require('dancing');
var matrix = [
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1],
  [0, 1, 0, 0, 0, 0, 1]
];
dlx.solve(matrix); //=> [[1, 3, 5]]
```

## License

This project is distributed under the MIT-LICENSE.

[knuth-dancing]: http://www-cs-faculty.stanford.edu/~uno/papers/dancing-color.ps.gz
[exact-cover]: http://en.wikipedia.org/wiki/Exact_cover

[travis-url]: http://travis-ci.org/wbyoung/dance
[travis-image]: https://secure.travis-ci.org/wbyoung/dance.png?branch=master
[npm-url]: https://npmjs.org/package/dance
[npm-image]: https://badge.fury.io/js/dance.png
[codeclimate-image]: https://codeclimate.com/github/wbyoung/dance.png
[codeclimate-url]: https://codeclimate.com/github/wbyoung/dance
[david-image]: https://david-dm.org/wbyoung/dance.png?theme=shields.io
[david-url]: https://david-dm.org/wbyoung/dance
