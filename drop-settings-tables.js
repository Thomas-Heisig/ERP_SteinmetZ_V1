const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('f:', 'ERP_SteinmetZ_V1', 'data', 'dev.sqlite3');
const db = new Database(dbPath);

console.log('Dropping existing settings tables...');

try {
  db.exec('DROP TABLE IF EXISTS system_settings_history');
  db.exec('DROP TABLE IF EXISTS system_settings');
  console.log('✅ Tables dropped successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();
