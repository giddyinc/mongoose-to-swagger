
import {expect} from 'chai';
import path from 'path';
import documentModel = require('.');
import mongoose from 'mongoose';

/**
* npx mocha lib/index.test.ts --watch
*/

describe(path.basename(__filename).replace('.test.js', ''), () => {
  describe('adjustType', () => {
    it('should work for string', () => {
      const result = documentModel.adjustType('String');
      expect(result).to.equal('string');
    });
    it('should work for object - 1 of 2', () => {
      const result = documentModel.adjustType('ObjectId');
      expect(result).to.equal('object');
    });
    it('should work for object - 2 of 2 - different spelling', () => {
      const result = documentModel.adjustType('ObjectID');
      expect(result).to.equal('object');
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
      expect(props.scopes).to.exist;
      expect(props.scopes.items.properties.actions.type).to.equal('array');
      expect(props.scopes.items.properties.actions.items.type).to.equal('string');
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
      expect(props.scopes).to.exist;
      expect(props.scopes.items.properties.actions.type).to.equal('array');
      expect(props.scopes.items.properties.actions.items.type).to.equal('string');
    });

    it('string', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.author).to.exist;
      expect(props.author.type).to.equal('string');
    });
    it('date', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.date).to.exist;
      expect(props.date.type).to.equal('string');
      expect(props.date.format).to.equal('date-time');
    });
    it('mongoose model relation', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.user).to.exist;
      expect(props.user.type).to.equal('string');
    });
    it('nested mongoose model', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.nestedUser).to.exist;
      expect(props.nestedUser.properties).to.exist;
    });
    it('array', () => {
      const result = documentModel({schema});
      const props = result.properties;
      expect(props.comments).to.exist;
      expect(props.comments.type).to.equal('array');
      expect(props.comments.items).to.exist;
      expect(Array.isArray(props.comments.items)).to.equal(false);
      expect(props.comments.items.properties).to.exist;
      expect(props.comments.items.properties.body).to.exist;
      expect(props.comments.items.properties.date).to.exist;
      expect(props.comments.items.properties.body).to.deep.equal({type: 'string'});
      expect(result.required).to.deep.equal(['hidden']);
    });
  });
});
