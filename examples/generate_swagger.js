
// node ./examples/generate_swagger
const mongoose = require('mongoose');
const m2s = require('../dist');
const Cat = mongoose.model('Cat', { name: String });
const swaggerSchema = m2s(Cat);
console.log(JSON.stringify(swaggerSchema, null, 2));
