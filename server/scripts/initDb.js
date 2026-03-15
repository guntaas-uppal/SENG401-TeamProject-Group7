const { initializeDatabase, dbPath } = require('../db/database');

initializeDatabase()
  .then(() => {
    console.log(`Database initialized successfully at: ${dbPath}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
