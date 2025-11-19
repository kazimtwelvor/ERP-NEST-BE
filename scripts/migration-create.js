const { execSync } = require('child_process');
const path = require('path');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.log('Usage: npm run migration:create <MigrationName>');
  process.exit(1);
}

const migrationPath = path.join('src', 'db', 'migrations', migrationName);

try {
  const command = `typeorm-ts-node-commonjs migration:create ${migrationPath}`;
  console.log(`Creating migration: ${migrationName}`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Migration creation failed');
  process.exit(1);
}

