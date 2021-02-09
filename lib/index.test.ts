
import { expect } from 'chai';
import documentModel = require('.');
import mongoose, { Schema } from 'mongoose';

const { getFieldsFromMongooseSchema } = documentModel;

/**
* npx mocha lib/index.test.ts --watch
*/

describe('index.test.ts', () => {

  describe('mixed', () => {
    it('basic mixed type handling', () => {
      const schema = new mongoose.Schema({
        a: {
          type: mongoose.Schema.Types.Mixed,
        },
      });
      const swagger = documentModel({ schema });
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.type).to.equal('object');
      expect(swagger.properties.a.properties).to.deep.equal({});
      console.log(JSON.stringify(swagger, null, 2));
    });
    it('basic mixed type handling - inferred', () => {
      const schema = new mongoose.Schema({
        a: {
          type: {},
        },
      });
      const swagger = documentModel({ schema });
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.type).to.equal('object');
      expect(swagger.properties.a.properties).to.deep.equal({});
      console.log(JSON.stringify(swagger, null, 2));
    });
    it('basic mixed type handling - inferred shorthand', () => {
      const schema = new mongoose.Schema({
        a: {},
      });
      const swagger = documentModel({ schema });
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.type).to.equal('object');
      expect(swagger.properties.a.properties).to.deep.equal({});
      console.log(JSON.stringify(swagger, null, 2));
    });

    it('nested mixed type handling', () => {
      const schema = new mongoose.Schema({
        a: new mongoose.Schema({
          b: {
            type: new mongoose.Schema({}),
          },
        }),
      });
      const swagger = documentModel({ schema: schema });
      expect(swagger.properties).to.exist;
      console.log(JSON.stringify(swagger, null, 2));
      expect(swagger.properties.a.properties.b.type).to.equal('object');
      expect(swagger.properties.a.properties.b.properties).to.deep.equal({
        _id: {
          type: 'string',
        },
      });
    });

    it('nested mixed type handling - inferred shorthand', () => {
      const schema = new mongoose.Schema({
        a: new mongoose.Schema({
          b: {},
        }),
      });
      const swagger = documentModel({ schema: schema });
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.properties.b.type).to.equal('object');
      expect(swagger.properties.a.properties.b.properties).to.deep.equal({});
    });

    it('nested mixed type handling - inferred shorthand 2', () => {
      const schema = new mongoose.Schema({
        a: new mongoose.Schema({
          b: { type: {} },
          c: String,
        }),
      });
      const swagger = documentModel({ schema: schema });
      console.log(JSON.stringify(swagger, null, 2));
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.properties.c.type).to.equal('string');
      expect(swagger.properties.a.properties.b.type).to.equal('object');
      expect(swagger.properties.a.properties.b.properties).to.deep.equal({});
    });

    it('nested mixed type handling - addtl fields', () => {
      const schema = new mongoose.Schema({
        a: new mongoose.Schema({
          b: {
            type: new mongoose.Schema({
              d: String,
              e: new mongoose.Schema({}),
            }),
          },
          c: String,
        }),
      });
      const swagger = documentModel({ schema: schema });
      console.log(JSON.stringify(swagger, null, 2));
      expect(swagger.properties).to.exist;
      expect(swagger.properties.a.properties.c.type).to.equal('string');
      expect(swagger.properties.a.properties.b.type).to.equal('object');
      expect(swagger.properties.a.properties.b.properties.d.type).to.equal('string');
      expect(swagger.properties.a.properties.b.properties.e.type).to.equal('object');
    });
  });

  it.skip('should do something', () => {
    const Cat = mongoose.model('Cat', new Schema({ name: String }));
    const swagger = documentModel(Cat);
    expect(swagger.properties).to.exist;
  });

  describe('adjustType', () => {
    it('should work for string', () => {
      const result = documentModel.adjustType('String');
      expect(result).to.equal('string');
    });
    it('should work for object - 1 of 2', () => {
      const result = documentModel.adjustType('ObjectId');
      expect(result).to.equal('string');
    });
    it('should work for object - 2 of 2 - different spelling', () => {
      const result = documentModel.adjustType('ObjectID');
      expect(result).to.equal('string');
    });
  });

  describe('documentModel', () => {
    let schema: Schema;
    before(() => {
      schema = new mongoose.Schema({
        title: String,
        author: String,
        body: String,
        comments: [{ body: String, date: Date }],
        likes: [],
        date: { type: Date, default: Date.now },
        hidden: { type: Boolean, required: true },
        toggles: {
          type: Map,
          of: Boolean,
        },
        meta: {
          votes: Number,
          favs: Number,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        nestedUser: new mongoose.Schema({
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        }),
      });
    });

    it('virtual handling', () => {
      const schema = new Schema({});
      schema.virtual('f', () => 'b');
      const result = documentModel({ schema });
      const virtualField = result.properties.f;
      expect(virtualField).to.not.exist;
    });

    it('sub schema array handling', () => {
      const Thing = new Schema({
        cost: {
          type: Number,
          required: true,
        },
      });
      const schema = new Schema({
        f: {
          things: {
            type: [Thing],
            required: true,
          },
        },
      });
      const result = documentModel({ schema });
      // console.log(JSON.stringify(result, null, 2));
      const field = result.properties.f;
      expect(field).to.exist;
      expect(field.type).to.equal('object');
      expect(field.properties.things).to.exist;
      expect(field.properties.things.type).to.equal('array');
      expect(field.properties.things.items.required).to.include('cost');
    });

    it('other various types', () => {
      const schema = new Schema({
        name: String,
        tags: [String],
        age: {
          type: Number,
        },
        bonus: {
          max: {
            type: Number,
          },
        },
        names: {
          asd: String,
          fgh: [String],
          fgz: [Number],
          jkl: [{
            foo: String,
          }],
        },
        birthday: Date,
        birthday2: { type: Date },
        status: {
          type: Number,
        },
        ref: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ref',
          required: true,
        },
        bla: [{
          foo: String,
          bar: String,
        }],
        schemaArr: [new Schema({
          type: {
            type: Number,
            enum: [1, 2, 3],
          },
        })],
      });
      schema.virtual('f', () => 'b');
      const results: any[] = getFieldsFromMongooseSchema(schema as any, { props: [] });

      const nameField = results.find(x => x.field === 'name');
      expect(nameField.type, 'nameField.type').to.exist;
      expect(nameField.type).to.equal('string');

      const tagsField = results.find(x => x.field === 'tags');
      expect(tagsField.type).to.equal('array');
      if (tagsField.type !== 'array') {
        throw new Error('fail');
      }

      expect(tagsField.items, 'tagsField.items').to.exist;
      expect(tagsField.items.type, 'tagsField.items.type').to.equal('string');

      const namesField = results.find(x => x.field === 'names');
      expect(namesField.type).to.equal('object');

      const birthdayField = results.find(x => x.field === 'birthday');
      expect(birthdayField.type).to.equal('string');
      expect(birthdayField.format).to.equal('date-time');

      const statusField = results.find(x => x.field === 'status');
      expect(statusField.type).to.equal('number');

      const refField = results.find(x => x.field === 'ref');
      expect(refField.type).to.equal('string');

      const schemaArr = results.find(x => x.field === 'schemaArr');

      if (schemaArr.type !== 'array') {
        throw new Error('fail');
      }

      if (schemaArr.items.type !== 'object') {
        throw new Error('fail');
      }

      expect(schemaArr.items.properties).to.exist;
      expect(schemaArr.items.properties.type).to.exist;
    });

    it('nested string array 1 of 2', () => {
      const result = documentModel({
        schema: new mongoose.Schema({
          scopes: [
            {
              actions: [String],
            },
          ],
        }),
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
              actions: [{ type: String, required: true }],
            },
          ],
        }),
      });
      const props = result.properties;
      expect(props.scopes).to.exist;
      expect(props.scopes.items.properties.actions.type).to.equal('array');
      expect(props.scopes.items.properties.actions.items.type).to.equal('string');
      const actions = props.scopes.items.properties.actions;
      // console.log(JSON.stringify(result, null, 2));
      // console.log(JSON.stringify(actions, null, 2));

    });

    it('string', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      // console.log(props);
      expect(props.author).to.exist;
      expect(props.author.type).to.equal('string');
    });

    it('string - lowercase', () => {
      const result = documentModel({
        schema: new Schema({
          author: {
            type: 'string',
          },
        }),
      });
      const props = result.properties;
      // console.log(props);
      expect(props.author).to.exist;
      expect(props.author.type).to.equal('string');
    });

    it('string + enum', () => {
      const result = documentModel({
        schema: new Schema({
          foo: {
            type: String,
            enum: ['bar', 'baz'],
            required: true,
          },
        }),
      });
      const props = result.properties;
      expect(props.foo).to.exist;
      expect(props.foo.type).to.equal('string');
      expect(props.foo.enum).to.exist;
      expect(props.foo.enum).to.not.be.empty;
      expect(props.foo.enum).to.contain('bar');
      // console.log(result);
      expect(result.required).to.not.be.empty;
      expect(result.required).to.contain('foo');
    });

    it('date', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      expect(props.date).to.exist;
      expect(props.date.type).to.equal('string');
      expect(props.date.format).to.equal('date-time');
    });

    it('map', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      expect(props.toggles).to.exist;
      expect(props.toggles.type).to.equal('object');
      const additionalProperties = props.toggles.additionalProperties;
      expect(additionalProperties).to.exist;
      expect(additionalProperties.type).to.equal('boolean');
    });

    it('mongoose model relation', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      expect(props.user).to.exist;
      expect(props.user.type).to.equal('string');
    });

    it('nested mongoose model', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      expect(props.nestedUser).to.exist;
      expect(props.nestedUser.properties).to.exist;
    });

    it('array', () => {
      const result = documentModel({ schema });
      const props = result.properties;
      expect(props.comments).to.exist;
      expect(props.comments.type).to.equal('array');
      expect(props.comments.items).to.exist;
      expect(Array.isArray(props.comments.items)).to.equal(false);
      expect(props.comments.items.properties).to.exist;
      expect(props.comments.items.properties.body).to.exist;
      expect(props.comments.items.properties.date).to.exist;
      expect(props.comments.items.properties.body).to.deep.equal({ type: 'string' });
      expect(result.required).to.deep.equal(['hidden']);
    });
  });

  describe('configurable meta fields', () => {
    it('should be able to add a an arbitrary field to a property on the root object', () => {
      const description = 'something cool';
      const bar = 'baz';
      const result = documentModel({
        schema: new Schema({
          foo: {
            type: String,
            description,
            bar,
          },
        }),
      }, {
        props: ['bar'],
      });
      // console.log(JSON.stringify(result, null, 2));
      const field = result.properties.foo;
      expect(field).to.exist;
      expect(field.description).to.equal(description);
      expect(field.bar).to.equal(bar);
      // expect(result.required).to.not.be.empty;
    });

    it('should be able to add a an arbitrary field to a property on a nested object', () => {
      const description = 'something cool';
      const bar = 'baz';
      const result = documentModel({
        schema: new Schema({
          foo: {
            buzz: {
              type: [{
                barry: {
                  type: String,
                  description,
                },
              }],
              description,
              bar,
            },
          },
        }),
      }, {
        props: ['bar'],
      });
      // console.log(JSON.stringify(result, null, 2));
      const field = result.properties.foo.properties.buzz;
      expect(field).to.exist;
      expect(field.description).to.equal(description);
      expect(field.bar).to.equal(bar);
      expect(field.items.properties.barry.description).to.equal(description);
      // expect(result.required).to.not.be.empty;
    });
  });

  describe('required array', () => {
    it('root props without required fields shold omit required array (for space?)', () => {
      const result = documentModel({
        schema: new Schema({
          foo: {
            type: String,
            enum: ['bar', 'baz'],
            // required: true,
          },
        }),
      });
      // console.log(result);
      expect(result.required).to.not.exist;
    });

    it('root with required fields should have the required array', () => {
      const result = documentModel({
        schema: new Schema({
          foo: {
            type: String,
            enum: ['bar', 'baz'],
            required: true,
          },
        }),
      });
      // console.log(result);
      expect(result.required).to.not.be.empty;
      expect(result.required).to.include('foo');
    });

    it('nested', () => {
      const Paw = new Schema({
        numToes: {
          type: Number,
          required: true,
        },
      });

      const schema = new Schema({
        name: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        hasTail: {
          type: Boolean,
        },
        paws: {
          type: [Paw],
          required: true,
        },
      });
      const result = documentModel({ schema });
      // console.log(JSON.stringify(result, null, 2));
      // console.log(JSON.stringify(result.properties.paws, null, 2));
      expect(result.required).to.not.be.empty;
      expect(result.required).to.not.contain(null);
      expect(result.properties.paws.items.required).to.not.be.empty;
      expect(result.properties.paws.items.required).to.not.contain(null);
      const [f] = result.properties.paws.items.required;
      expect(f).to.exist;
    });

    it('nested - alt format', () => {
      const Paw = new Schema({
        numToes: {
          type: Number,
          required: true,
        },
      });

      const schema = new Schema({
        name: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        hasTail: {
          type: Boolean,
        },
        paws: [Paw],
      });
      const result = documentModel({ schema });
      // console.log(JSON.stringify(result, null, 2));
      // console.log(JSON.stringify(result.properties.paws, null, 2));
      expect(result.required).to.not.be.empty;
      expect(result.required).to.not.contain(null);
      expect(result.properties.paws.items.required).to.not.be.empty;
      expect(result.properties.paws.items.required).to.not.contain(null);
      const [f] = result.properties.paws.items.required;
      expect(f).to.exist;
    });

    it('other various types', () => {
      const schema = new mongoose.Schema({
        a: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        b: { type: Number, default: 0 },
        c: String,
        d: { type: mongoose.Schema.Types.ObjectId },
        e: String,
        f: Object,
        g: { type: mongoose.Schema.Types.Mixed },
        h: Boolean,
        i: [Object],
        j: {
          type: Object,
        },
        k: {
          type: [Object],
        },
      });
      const result = documentModel({ modelName: 'Cat', schema });
    });

  });

  it('should be able to remove _id field by default', () => {
    const result = documentModel({
      schema: new Schema({
        foo: {
          name: String,
          surname: String,
          nickname: String,
        },
      }),
    });
    const root = result.properties;
    expect(root).to.exist;
    expect(root._id).to.not.exist;
  });

  it('should be able to leave _id field', () => {
    const result = documentModel({
      schema: new Schema({
        foo: {
          name: String,
          surname: String,
          nickname: String,
        },
      }),
    }, {
      omitId: false,
    });
    const root = result.properties;
    expect(root).to.exist;
    expect(root._id).to.exist;
  });
});
