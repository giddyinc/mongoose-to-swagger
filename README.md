[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

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

### Meta properties

By default, `description`, `enum`, and `required` fields are extracted from the mongoose schema definitions and placed into the correspoding swagger properties definitions. Additional meta props can be whitelisted using the props array on the options argument.

```ts

const Cat = mongoose.model('Cat', { 
    name: String,
    /**
     * Custom field
     */
    bar: 'baz',
});

const options = { 
    /**
     * Whitelist of custom fields.
     */
    props: ['bar'], 
};

const swaggerSchema = m2s(Cat, options);

```



## Contributing
We look forward to seeing your contributions!


## License

MIT © [Ben Lugavere](http://benlugavere.com/)

[npm-image]: https://badge.fury.io/js/mongoose-to-swagger.svg
[npm-url]: https://npmjs.org/package/mongoose-to-swagger
[travis-image]: https://travis-ci.org/giddyinc/mongoose-to-swagger.svg?branch=master
[travis-url]: https://travis-ci.org/giddyinc/mongoose-to-swagger
[coveralls-image]: https://coveralls.io/repos/giddyinc/mongoose-to-swagger/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/giddyinc/mongoose-to-swagger?branch=master
