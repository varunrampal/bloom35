import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATABASE_DIRECTORY = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATABASE_DIRECTORY, "bloom35.sqlite");

const globalForDatabase = globalThis as typeof globalThis & {
  bloom35Database?: DatabaseSync;
};

type DatabaseColumn = {
  name: string;
};

const hasColumn = (database: DatabaseSync, columnName: string) => {
  const columns = database
    .prepare("PRAGMA table_info(affiliate_products);")
    .all() as DatabaseColumn[];

  return columns.some((column) => column.name === columnName);
};

const ensureColumn = (
  database: DatabaseSync,
  columnName: string,
  sqlDefinition: string,
) => {
  if (!hasColumn(database, columnName)) {
    database.exec(
      `ALTER TABLE affiliate_products ADD COLUMN ${columnName} ${sqlDefinition};`,
    );
  }
};

const initializeDatabase = (database: DatabaseSync) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS affiliate_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      affiliate_url TEXT NOT NULL UNIQUE,
      resolved_url TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      image_src TEXT NOT NULL,
      image_alt TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Support',
      best_for TEXT NOT NULL DEFAULT 'Everyday support',
      note TEXT NOT NULL DEFAULT '',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      cta_label TEXT NOT NULL DEFAULT 'View on Amazon',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn(database, "is_featured", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "is_enabled", "INTEGER NOT NULL DEFAULT 1");

  database.exec("UPDATE affiliate_products SET note = '' WHERE note <> '';");
};

const createDatabase = () => {
  mkdirSync(DATABASE_DIRECTORY, { recursive: true });

  const database = new DatabaseSync(DATABASE_PATH);

  initializeDatabase(database);

  return database;
};

export const getDatabase = () => {
  if (!globalForDatabase.bloom35Database) {
    globalForDatabase.bloom35Database = createDatabase();
  }

  return globalForDatabase.bloom35Database;
};

export const databasePath = DATABASE_PATH;
