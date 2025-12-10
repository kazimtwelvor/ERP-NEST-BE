import dataSource from '../src/db/data-source';

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✓ Connected to database\n');

    console.log('🗑️  Dropping all tables...');
    await dataSource.dropDatabase();
    console.log('✓ All tables dropped\n');

    console.log('📦 Running migrations...');
    await dataSource.runMigrations();
    console.log('✓ Migrations completed\n');

    console.log('🌱 Running seeds...');
    // Import and run seeds
    const { runSeeds } = require('../src/db/seeds/index');
    await runSeeds(dataSource);
    console.log('✓ Seeds completed\n');

    console.log('✅ Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}

resetDatabase();

