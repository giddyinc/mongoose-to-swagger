
import { isString } from 'util';

const mapMongooseTypeToSwaggerType = (type): 'string' | 'number' | 'boolean' | 'array' | 'object' => {
  if (!type) {
    return null;
  }

  if (type === Number || (isString(type) && type.toLowerCase() === 'number')) {
    return 'number';
  }

  if (type === String || (isString(type) && type.toLowerCase() === 'string')) {
    return 'string';
  }

  if (type === Boolean || (isString(type) && type.toLowerCase() === 'boolean')) {
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

const supportedMetaProps = [
  'enum',
  'required',
  'description'
];

const mapSchemaTypeToFieldSchema = ({
  key,
  value
}: {
  value: any;
  key?: string;
}) => {
  // console.log(key);
  const swaggerType = mapMongooseTypeToSwaggerType(value);
  const meta: any = {};

  for (const metaProp of supportedMetaProps) {
    if (value[metaProp] != null) {
      meta[metaProp] = value[metaProp];
    }
  }

  if (value === Date || value.type === Date) {
    meta.format = 'date-time';
  } else if (swaggerType === 'array') {
    const arraySchema = Array.isArray(value) ? value[0] : value.type[0];
    const items = mapSchemaTypeToFieldSchema({ value: arraySchema || {} });
    meta.items = items;
  } else if (swaggerType === 'object') {
    let fields: Array<Field> = [];
    if (value && value.constructor && value.constructor.name === 'Schema') {
      fields = getFieldsFromMongooseSchema(value);
    } else {
      const subSchema = value.type ? value.type : value;
      fields = getFieldsFromMongooseSchema({ tree: subSchema });
    }

    const properties = {};

    for (const field of fields) {
      properties[field.field] = field;
      delete field.field;
    }

    meta.properties = properties;
  }

  const result = {
    type: swaggerType,
    ...meta,
  };

  if (key) {
    result.field = key;
  }

  return result;
};

const getFieldsFromMongooseSchema = (schema: any): any => {
  const fields: Field[] = [];
  const tree = schema.tree;
  const keys = Object.keys(schema.tree);

  for (const key of keys) {
    if (key === 'id') {
      continue;
    }

    const value = tree[key];

    const field: Field = mapSchemaTypeToFieldSchema({ key, value });
    const required = [];

    if (field.type === 'object') {
      for (const f of Object.values(field.properties) as any[]) {
        if (f.required) {
          required.push(f.field);
          delete f.required;
        }
      }
    }

    if (field.type === 'array' && field.items.type === 'object') {
      field.items.required = [];
      for (const key in field.items.properties) {
        const val = field.items.properties[key];
        if (val.required) {
          field.items.required.push(key);
          delete val.required;
        }
      }
    }

    fields.push(field);
  }

  return fields;
};

function documentModel(Model): any {
  // console.log('swaggering', Model.modelName);
  const schema = Model.schema;
  const fields = getFieldsFromMongooseSchema(schema);

  const obj = {
    title: Model.modelName,
    required: [],
    properties: {}
  };

  for (const field of fields) {
    if (field.field === '__v') {
      continue;
    }
    obj.properties[field.field] = field;
    if (field.required) {
      obj.required.push(field.field);
      delete field.field;
      delete field.required;
    }
  }

  return obj;
}

documentModel.adjustType = mapMongooseTypeToSwaggerType;
documentModel.getFieldsFromMongooseSchema = getFieldsFromMongooseSchema;

export = documentModel;

type Field = DateField | NumberField | StringField | ObjectField | ArrayField;

type StringField = {
  type: 'string',
  format?: string;
  field?: string;
  required?: boolean;
}
type DateField = {
  type: 'string',
  format: string;
  field?: string;
  required?: boolean;
}
type NumberField = {
  type: 'float',
  format?: string;
  field?: string;
  required?: boolean;
}
type ObjectField = {
  type: 'object',
  format?: string;
  field?: string;
  required: string[];
  properties: any;
}
type ArrayField = {
  type: 'array',
  format?: string;
  field?: string;
  required: string[];
  items: Field;
}
