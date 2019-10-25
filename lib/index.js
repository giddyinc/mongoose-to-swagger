/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */

'use strict';

const mapMongooseTypeToSwaggerType = type => {
  if (!type) {
    return null;
  }
  if (type === Number || type === 'Number') {
    return 'number';
  }
  if (type === String || type === 'String') {
    return 'string';
  }
  if (type === Boolean || type === 'Boolean') {
    return 'boolean';
  }
  if (type instanceof Function) {
    // special types
    if (type.name === 'ObjectId' || type.name === 'ObjectID') {
      return 'string';
    }
    if (type.name === 'Date') {
      return 'string';
    }
    return type.name.toLowerCase();
  }

  if (type.type != null) {
    return mapMongooseTypeToSwaggerType(type.type);
  }

  if (Array.isArray(type)) {
    return 'array';
  }

  return 'object';
};

function documentModel(Model) {
  const obj = {
    title: Model.modelName,
    properties: {},
    required: []
  };

  // const keys = Object.keys(Model.schema.tree);
  // console.log(keys);

  const pathsToSchema = (parent, paths) => {
    Object.keys(paths).map(x => paths[x]).forEach(mongooseProp => {
      parent[mongooseProp.path] = {};
      // const type = mapMongooseTypeToSwaggerType(mongooseProp);
      // console.log(type);
      const modelProp = parent[mongooseProp.path];

      if (mongooseProp.instance === 'Array') {
        // console.log(mongooseProp.schema);
        modelProp.type = 'array';
        modelProp.items = {
          properties: {}
        };

        if (mongooseProp.schema) {
          pathsToSchema(modelProp.items.properties, mongooseProp.schema.paths);
        } else if (mongooseProp.options && mongooseProp.options.type != null && (Array.isArray(mongooseProp.options.type) || mongooseProp.options.type === 'array')) {
          modelProp.items = {type: mapMongooseTypeToSwaggerType(mongooseProp.options.type[0])};
        } else {
          modelProp.items = {
            type: 'object'
          };
        }
      } else if (mongooseProp.instance === 'Embedded') {
        modelProp.properties = {};
        modelProp.type = 'object';
        pathsToSchema(modelProp.properties, mongooseProp.schema.paths);
      } else if (mongooseProp.instance === 'ObjectID') {
        modelProp.type = 'string';
        modelProp.required = mongooseProp.isRequired || false;
      } else if (mongooseProp.instance === 'Date') {
        modelProp.type = 'string';
        modelProp.format = 'date-time';
        modelProp.required = mongooseProp.isRequired || false;
      } else {
        modelProp.type = mapMongooseTypeToSwaggerType(mongooseProp.instance);
        modelProp.required = mongooseProp.isRequired || false;
      }
      // custom mongoose options
      if (mongooseProp.options) {
        if (mongooseProp.options.description) {
          modelProp.description = mongooseProp.options.description;
        }
      }
      if (mongooseProp.enumValues && mongooseProp.enumValues.length) {
        modelProp.enum = mongooseProp.enumValues;
      }
      if (modelProp.required) {
        obj.required.push(mongooseProp.path);
      }
      delete modelProp.required;
    });
  };

  pathsToSchema(obj.properties, Model.schema.paths);

  return obj;
}

documentModel.adjustType = mapMongooseTypeToSwaggerType;

module.exports = documentModel;
