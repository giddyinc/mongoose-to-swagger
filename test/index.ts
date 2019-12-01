
import {expect} from 'chai';
import mongoose, {Schema} from 'mongoose';
import m2s = require('../lib');

/**
 * npx mocha test --watch
 */

describe('mongoose-to-swagger', function () {
  afterEach(() => {
    delete mongoose.models.Cat;
    delete mongoose.models.Dog;
    delete mongoose.models.AbstractDog;
  });
  describe('export', () => {
    beforeEach(() => { });
    it('should do something', () => {
      const Cat = mongoose.model('Cat', new Schema({name: String}));
      const swaggerSchema = m2s(Cat);
      expect(swaggerSchema.properties).to.exist;
    });
  });
  describe('when there are required schema props', () => {
    it('should pull those to the top level array of the swagger definition', () => {
      const Dog = mongoose.model('Dog', new Schema({
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
      }));
      const swaggerSchema = m2s(Dog);
      expect(swaggerSchema.required).to.deep.equal(['name', 'likesWater']);
    });
    it('should allow enums', () => {
      const Dog = mongoose.model('AbstractDog', new Schema({
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
      }));
      const swaggerSchema = m2s(Dog);
      expect(swaggerSchema.required).to.deep.equal(['name', 'type']);
      expect(swaggerSchema.properties.type.enum).to.deep.equal(['1', '2']);
      expect(swaggerSchema.properties.type.description).to.be.a('string');
    });
  });
});
