
import { isString } from 'util';
import { ObjectId } from 'bson';

const mapMongooseTypeToSwaggerType = (type): 'string' | 'number' | 'boolean' | 'array' | 'object' | 'map' | null => {
  if (!type) {
    return null;
  }

  if (type === Number || (isString(type) && type.toLowerCase() === 'number')) {
    return 'number';
  }

  if (type === String || (isString(type) && type.toLowerCase() === 'string')) {
    return 'string';
  }

  if (type.schemaName === 'Mixed') {
    return 'object';
  }

  if (type === 'ObjectId' || type === 'ObjectID') {
    return 'string';
  }

  if (type === ObjectId) {
    return 'string';
  }

  if (type === Boolean || (isString(type) && type.toLowerCase() === 'boolean')) {
    return 'boolean';
  }

  if (type === Map) {
    return 'map';
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

  if (type.instance) {
    switch (type.instance) {
      case 'Array':
      case 'DocumentArray':
        return 'array';
      case 'ObjectId':
      case 'ObjectID':
      case 'SchemaDate':
        return 'string';
      case 'Mixed':
        return 'object';
      case 'String':
      case 'SchemaString':
      case 'SchemaBuffer':
      case 'SchemaObjectId':
        return 'string';

      case 'SchemaArray':
        return 'array';
      case 'Boolean':
      case 'SchemaBoolean':
        return 'boolean';
      case 'Number':
      case 'SchemaNumber':
        return 'number';
      default:
    }
  }

  if (Array.isArray(type)) {
    return 'array';
  }

  if (type.$schemaType) {
    return mapMongooseTypeToSwaggerType(type.$schemaType.tree);
  }

  if (type.getters && Array.isArray(type.getters) && type.path != null) {
    return null; // virtuals should not render
  }

  return 'object';
};

const defaultSupportedMetaProps = [
  'enum',
  'required',
  'description',
];

const mapSchemaTypeToFieldSchema = ({
  key = null, // null = array field
  value,
  props,
}: {
  value: any;
  key?: string | null;
  props: string[];
}): Field => {
  const swaggerType = mapMongooseTypeToSwaggerType(value);
  const meta: any = {};

  for (const metaProp of props) {
    if (value && value[metaProp] != null) {
      meta[metaProp] = value[metaProp];
    }
  }

  if (value === Date || value.type === Date) {
    meta.format = 'date-time';
  } else if (swaggerType === 'array') {
    const arraySchema = Array.isArray(value) ? value[0] : value.type[0];
    const items = mapSchemaTypeToFieldSchema({ value: arraySchema || {}, props });
    meta.items = items;
  } else if (swaggerType === 'object') {
    let fields: Array<Field> = [];
    if (value && value.constructor && value.constructor.name === 'Schema') {
      fields = getFieldsFromMongooseSchema(value, { props });
    } else {
      const subSchema = value.type ? value.type : value;
      if (subSchema.obj && Object.keys(subSchema.obj).length > 0) {
        fields = getFieldsFromMongooseSchema({ tree: subSchema.tree ? subSchema.tree : subSchema }, { props });
      } else if (subSchema.schemaName !== 'Mixed') {
        fields = getFieldsFromMongooseSchema({ tree: subSchema.tree ? subSchema.tree : subSchema }, { props });
      }
    }

    const properties = {};

    for (const field of fields.filter(f => f.type != null)) {
      properties[field.field as any] = field;
      delete field.field;
    }

    meta.properties = properties;
  } else if (swaggerType === 'map') {
    const subSchema = mapSchemaTypeToFieldSchema({ value: value.of || {}, props });
    // swagger defines map as an `object` type
    meta.type = 'object';
    // with `additionalProperties` instead of `properties`
    meta.additionalProperties = subSchema;
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

const getFieldsFromMongooseSchema = (schema: {
  tree: Record<string, any>;
}, options: { props: string[] }): any[] => {
  const { props } = options;
  const tree = schema.tree;
  const keys = Object.keys(schema.tree);
  const fields: Field[] = [];

  // loop over the tree of mongoose schema types
  // and return an array of swagger fields
  for (const key of keys
    .filter(x => x != 'id')
  ) {
    const value = tree[key];

    // swagger object
    const field: Field = mapSchemaTypeToFieldSchema({ key, value, props });
    const required: string[] = [];

    if (field.type === 'object') {
      const { field: propName } = field;
      const fieldProperties = field.properties || field.additionalProperties;
      for (const f of Object.values(fieldProperties) as any[]) {
        if (f.required && propName != null) {
          required.push(propName);
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

let omitted = new Set(['__v', '_id']);
const removeOmitted = (swaggerFieldSchema: {
  /**
   * for setting field on .properties map - gets removed before returned
   */
  field: string,
  /**
   * swagger type
   */
  type: string,
}) => {
  return swaggerFieldSchema.type != null && !omitted.has(swaggerFieldSchema.field);
};

/**
 * Entry Point
 * @param Model Mongoose Model Instance
 */
function documentModel(Model, options: { props?: string[], omitId?: boolean } = {}): any {
  let {
    props = [],
    omitId = true,
  } = options;
  props = [...defaultSupportedMetaProps, ...props];
  omitted = new Set(omitId ? ['__v', '_id'] : ['__v']);
  // console.log('swaggering', Model.modelName);
  const schema = Model.schema;

  // get an array of deeply hydrated fields
  const fields = getFieldsFromMongooseSchema(schema, { props });

  // root is always an object
  const obj = {
    title: Model.modelName,
    required: [] as string[],
    properties: {},
  };

  // key deeply hydrated fields by field name
  for (const field of fields.filter(removeOmitted)) {
    const { field: fieldName } = field;
    delete field.field;
    obj.properties[fieldName] = field;
    if (field.required && fieldName != null) {
      obj.required.push(fieldName);
      delete field.required;
    }
  }

  if (!obj.required || !obj.required.length) {
    delete obj.required;
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
  properties?: any;
  additionalProperties?: any;
}
type ArrayField = {
  type: 'array',
  format?: string;
  field?: string;
  required: string[];
  items: Field;
}
