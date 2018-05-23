[![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/giddyinc/mongoose-to-swagger.svg?branch=master)](https://travis-ci.org/giddyinc/mongoose-to-swagger) [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status](https://coveralls.io/repos/github/giddyinc/mongoose-to-swagger/badge.svg?branch=master)](https://coveralls.io/github/giddyinc/mongoose-to-swagger?branch=master)

# mongoose-to-swagger 

Conversion library for transforming [Mongoose](http://mongoosejs.com/) schema objects into [Swagger](http://swagger.io) schema definitions.

## Installation

```sh
$ npm install --save mongoose-to-swagger
```

## Overview

Converts a mongoose model into a swagger schema.

## Usage

```js
const mongoose = require('mongoose');
const m2s = require('mongoose-to-swagger');
const Cat = mongoose.model('Cat', { name: String });
const swaggerSchema = m2s(Cat);
console.log(swaggerSchema);
```

## Contributing
We look forward to seeing your contributions!


## License

MIT © [Ben Lugavere](http://benlugavere.com/)

[npm-image]: https://badge.fury.io/js/mongoose-to-swagger.svg
[npm-url]: https://npmjs.org/package/mongoose-to-swagger
[travis-image]: https://travis-ci.org/giddyinc/mongoose-to-swagger.svg?branch=master
[travis-url]: https://travis-ci.org/giddyinc/mongoose-to-swagger
[daviddm-image]: https://david-dm.org/giddyinc/mongoose-to-swagger.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/giddyinc/mongoose-to-swagger
[coveralls-image]: https://coveralls.io/repos/giddyinc/mongoose-to-swagger/badge.svg
[coveralls-url]: https://coveralls.io/r/giddyinc/mongoose-to-swagger
