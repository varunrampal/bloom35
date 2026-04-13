import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_DATABASE_FILENAME = "bloom35.sqlite";

const resolveDatabasePath = () => {
  const configuredPath = process.env.BLOOM35_DATABASE_PATH?.trim();

  if (configuredPath) {
    return configuredPath;
  }

  if (process.env.VERCEL) {
    // Vercel Functions mount the deployment bundle read-only under /var/task.
    return path.join("/tmp", "bloom35", DEFAULT_DATABASE_FILENAME);
  }

  return path.join(process.cwd(), "data", DEFAULT_DATABASE_FILENAME);
};

const DATABASE_PATH = resolveDatabasePath();
const DATABASE_DIRECTORY = DATABASE_PATH === ":memory:"
  ? null
  : path.dirname(DATABASE_PATH);

const globalForDatabase = globalThis as typeof globalThis & {
  bloom35Database?: DatabaseSync;
};

type DatabaseColumn = {
  name: string;
};

const hasColumn = (
  database: DatabaseSync,
  tableName: string,
  columnName: string,
) => {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName});`)
    .all() as DatabaseColumn[];

  return columns.some((column) => column.name === columnName);
};

const ensureColumn = (
  database: DatabaseSync,
  tableName: string,
  columnName: string,
  sqlDefinition: string,
) => {
  if (!hasColumn(database, tableName, columnName)) {
    database.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${sqlDefinition};`,
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

  database.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      breadcrumb TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL DEFAULT 'Guide',
      subtitle TEXT NOT NULL DEFAULT '',
      author_name TEXT NOT NULL DEFAULT 'Bloom35 Editorial Team',
      author_role TEXT NOT NULL DEFAULT 'Bloom35 editorial',
      content_json TEXT NOT NULL DEFAULT '{}',
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn(
    database,
    "affiliate_products",
    "is_featured",
    "INTEGER NOT NULL DEFAULT 0",
  );
  ensureColumn(
    database,
    "affiliate_products",
    "is_enabled",
    "INTEGER NOT NULL DEFAULT 1",
  );
  ensureColumn(database, "blog_posts", "breadcrumb", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(
    database,
    "blog_posts",
    "label",
    "TEXT NOT NULL DEFAULT 'Guide'",
  );
  ensureColumn(database, "blog_posts", "subtitle", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(
    database,
    "blog_posts",
    "author_name",
    "TEXT NOT NULL DEFAULT 'Bloom35 Editorial Team'",
  );
  ensureColumn(
    database,
    "blog_posts",
    "author_role",
    "TEXT NOT NULL DEFAULT 'Bloom35 editorial'",
  );
  ensureColumn(
    database,
    "blog_posts",
    "content_json",
    "TEXT NOT NULL DEFAULT '{}'",
  );

  database.exec("UPDATE affiliate_products SET note = '' WHERE note <> '';");
};

const createDatabase = () => {
  if (DATABASE_DIRECTORY) {
    mkdirSync(DATABASE_DIRECTORY, { recursive: true });
  }

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
