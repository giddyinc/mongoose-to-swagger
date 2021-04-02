
'use strict';

module.exports = {
  diff: true,
  require: [
    'source-map-support/register', 
    'ts-node/register'
  ],
  extension: ['ts'],
  package: './package.json',
  reporter: 'spec',
  ui: 'bdd',
  'watch-files': ['*.ts'],
  'watch-extensions': ['ts'],
  recursive: true,
  exit: true,
  checkLeaks: true,
  bail: true,
};
