
import path from 'path';
import fs from 'fs';
import express from 'express';
import mongoose, { Model, Document, Mongoose, Schema } from 'mongoose';
import m2s from '../../../lib';

const app = express();

const Paw = new Schema({
  numToes: {
    type: Number,
    required: true,
  }
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
  }
});

const Cat = mongoose.model('Cat', schema);

const swagger = {
  definitions: {
    Cat: m2s(Cat),
  },
  host: '',
  info: {
    title: 'My Express App',
    version: '1.0.0'
  },
  paths: {
    '/cats': {
      get: {
        responses: {
          200: {
            description: 'All Cats',
            schema: {
              items: {
                $ref: '#/definitions/Cat'
              },
              type: 'array'
            }
          }
        },
        produces: [
          'application/json'
        ],
        tags: [
          'Cats'
        ],
        parameters: []
      }
    }
  },
  securityDefinitions: {},
  swagger: '2.0',
  tags: []
};

// fs.writeFileSync(path.join(__dirname, './swagger.json'), JSON.stringify(swagger, null, 2));
console.log(JSON.stringify(swagger.definitions.Cat, null, 2));

app.get('/cats', (req, res) => res.send([]));

app.get('/swagger', (req, res) => res.send(swagger));

app.use('/', express.static(path.join(__dirname, '../docs')));

app.listen('3000', () => console.log('Listening on Port 3000'));
