import { backupDatabase } from '../src/modules/persistence/sqlite.persistence.js';

const destination = await backupDatabase();
console.log(`SQLite backup created at: ${destination}`);
