
'use strict';

const expect = require('expect');
const mongoose = require('mongoose');
const m2s = require('../lib');

/**
 * mocha test --watch
 */

describe('mongoose-to-swagger', function () {
  describe('export', () => {
    beforeEach(() => { });
    it('should do something', () => {
      const Cat = mongoose.model('Cat', {name: String});
      const swaggerSchema = m2s(Cat);
      expect(swaggerSchema.properties).toExist();
    });
  });
  describe('when there are required schema props', () => {
    it('should pull those to the top level array of the swagger definition', () => {
      const Dog = mongoose.model('Dog', {
        name: {
          type: String,
          required: true
        },
        likesWater: {
          type: Boolean,
          required: true
        },
        isGoodBoy: {
          type: Boolean
        }
      });
      const swaggerSchema = m2s(Dog);
      expect(swaggerSchema.required).toEqual(['name', 'likesWater']);
    });
    it('should allow enums', () => {
      const Dog = mongoose.model('AbstractDog', {
        name: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: [1, 2],
          description: 'Hotdog or Not Hotdog?',
          required: true
        }
      });
      const swaggerSchema = m2s(Dog);
      expect(swaggerSchema.required).toEqual(['name', 'type']);
      expect(swaggerSchema.properties.type.enum).toEqual(['1', '2']);
      expect(swaggerSchema.properties.type.description).toBeAn('string');
    });
  });
});
