
'use strict';

const expect = require('expect');
const path = require('path');
const documentModel = require('.');
const mongoose = require('mongoose');

/**
* mocha --require clarify lib/index.test.js --watch
* istanbul cover --print both node_modules/.bin/_mocha -- lib/index.test.js
* eslint ./path/to/file.test.js --watch
*/

describe(path.basename(__filename).replace('.test.js', ''), () => {
  describe('adjustType', () => {
    it('should work for string', () => {
      const result = documentModel.adjustType('String');
      expect(result).toBe('string');
    });
    it('should work for object - 1 of 2', () => {
      const result = documentModel.adjustType('ObjectId');
      expect(result).toBe('object');
    });
    it('should work for object - 2 of 2 - different spelling', () => {
      const result = documentModel.adjustType('ObjectID');
      expect(result).toBe('object');
    });
  });
  describe('documentModel', () => {
    let schema;
    before(() => {
      schema = new mongoose.Schema({
        title: String,
        author: String,
        body: String,
        comments: [{body: String, date: Date}],
        likes: [],
        date: {type: Date, default: Date.now},
        hidden: {type: Boolean, required: true},
        meta: {
          votes: Number,
          favs: Number
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        nestedUser: new mongoose.Schema({
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
        })
      });
    });

    it('string', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.author).toExist();
      expect(props.author.type).toBe('string');
    });
    it('date', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.date).toExist();
      expect(props.date.type).toBe('string');
      expect(props.date.format).toBe('datetime');
    });
    it('mongoose model relation', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.user).toExist();
      expect(props.user.type).toBe('string');
    });
    it('nested mongoose model', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.nestedUser).toExist();
      expect(props.nestedUser.properties).toExist();
    });
    it('array', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.comments).toExist();
      expect(props.comments.type).toBe('array');
      expect(props.comments.items).toExist();
      expect(props.comments.items).toNotBeA(Array);
      expect(props.comments.items.properties).toExist();
      expect(props.comments.items.properties.body).toExist();
      expect(props.comments.items.properties.date).toExist();
      expect(props.comments.items.properties.body).toEqual({type: 'string'});
      expect(result.required).toEqual(['hidden']);
    });
  });
});
