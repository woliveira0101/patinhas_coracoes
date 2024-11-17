const fs = require('fs');
const path = require('path');

// Read the main swagger file
const mainSwagger = require('../swagger.json');

// Directory containing endpoint files
const endpointsDir = path.join(__dirname, 'endpoints');

// Read all endpoint files and combine their paths
const paths = {};
fs.readdirSync(endpointsDir).forEach(file => {
  if (file.endsWith('.json')) {
    const endpointContent = require(path.join(endpointsDir, file));
    Object.assign(paths, endpointContent);
  }
});

// Add the combined paths to the main swagger file
mainSwagger.paths = paths;

// Write the combined swagger file
fs.writeFileSync(
  path.join(__dirname, '../swagger.json'),
  JSON.stringify(mainSwagger, null, 2),
  'utf8'
);

console.log('Swagger documentation combined successfully!');
