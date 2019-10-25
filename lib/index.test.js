
'use strict';

const expect = require('expect');
const path = require('path');
const documentModel = require('.');
const mongoose = require('mongoose');

/**
* npx mocha lib/index.test.js --watch
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

    it('nested string array 1 of 2', () => {
      const result = documentModel({
        schema: new mongoose.Schema({
          scopes: [
            {
              actions: [String]
            }
          ]
        })
      });
      const props = result.properties;
      expect(props.scopes).toBeTruthy();
      expect(props.scopes.items.properties.actions.type).toEqual('array');
      expect(props.scopes.items.properties.actions.items.type).toEqual('string');
    });

    it('nested string array 2 of 2', () => {
      const result = documentModel({
        schema: new mongoose.Schema({
          scopes: [
            {
              actions: [{type: String}]
            }
          ]
        })
      });
      const props = result.properties;
      expect(props.scopes).toBeTruthy();
      expect(props.scopes.items.properties.actions.type).toEqual('array');
      expect(props.scopes.items.properties.actions.items.type).toEqual('string');
    });

    it('string', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.author).toBeTruthy();
      expect(props.author.type).toBe('string');
    });
    it('date', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.date).toBeTruthy();
      expect(props.date.type).toBe('string');
      expect(props.date.format).toBe('date-time');
    });
    it('mongoose model relation', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.user).toBeTruthy();
      expect(props.user.type).toBe('string');
    });
    it('nested mongoose model', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.nestedUser).toBeTruthy();
      expect(props.nestedUser.properties).toBeTruthy();
    });
    it('array', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.comments).toBeTruthy();
      expect(props.comments.type).toBe('array');
      expect(props.comments.items).toBeTruthy();
      expect(Array.isArray(props.comments.items)).toBe(false);
      expect(props.comments.items.properties).toBeTruthy();
      expect(props.comments.items.properties.body).toBeTruthy();
      expect(props.comments.items.properties.date).toBeTruthy();
      expect(props.comments.items.properties.body).toEqual({type: 'string'});
      expect(result.required).toEqual(['hidden']);
    });
  });
});
