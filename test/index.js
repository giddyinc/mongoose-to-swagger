
'use strict';

const expect = require('expect');
const mongoose = require('mongoose');
const m2s = require('../lib');

/**
 * mocha --require babel-register test --watch
 */

describe('mongoose-to-swagger', function () {
  describe('export', () => {
    beforeEach(() => { });
    it('should do something', () => {
      const Cat = mongoose.model('Cat', {name: String});
      const swaggerSchema = m2s(Cat);
      expect(swaggerSchema.id).toBe('Cat');
      expect(swaggerSchema.properties).toExist();
    });
  });
});
