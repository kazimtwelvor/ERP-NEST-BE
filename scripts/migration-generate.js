const { execSync } = require('child_process');
const path = require('path');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.log('Usage: npm run migration:generate <MigrationName>');
  process.exit(1);
}

const migrationPath = path.join('src', 'db', 'migrations', migrationName);

try {
  const command = `typeorm-ts-node-commonjs migration:generate -d src/db/data-source.ts ${migrationPath}`;
  console.log(`Generating migration: ${migrationName}`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Migration generation failed');
  process.exit(1);
}

