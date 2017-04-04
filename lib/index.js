'use strict';

const adjustType = type => {
  let newType;
  if (type === 'ObjectId' || type === 'ObjectID') {
    newType = 'object';
  } else {
    newType = type;
  }
  return newType.toLowerCase();
};

function documentModel(Model) {
  const modelName = Model.modelName;
  const obj = {
    id: modelName,
    properties: {}
  };

  const pathsToSchema = (parent, paths) => {
    Object.values(paths).forEach(mongooseProp => {
      // define object on prop key
      parent[mongooseProp.path] = {};
      const modelProp = parent[mongooseProp.path];

      if (mongooseProp.instance === 'Array') {
        modelProp.type = 'array';
        modelProp.items = {
          properties: {}
        };
        if (mongooseProp.schema) {
          pathsToSchema(modelProp.items.properties, mongooseProp.schema.paths);
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
        modelProp.format = 'date';
        modelProp.required = mongooseProp.isRequired || false;
      } else {
        modelProp.type = adjustType(mongooseProp.instance);
        modelProp.required = mongooseProp.isRequired || false;
      }
    });
  };

  pathsToSchema(obj.properties, Model.schema.paths);

  return obj;
}

documentModel.adjustType = adjustType;

module.exports = documentModel;
