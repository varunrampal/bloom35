import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  createClient,
  type Client,
  type InArgs,
  type ResultSet,
} from "@libsql/client";

const DEFAULT_DATABASE_FILENAME = "bloom35.sqlite";
const DATABASE_SCHEMA_VERSION = 2;

type DatabaseColumnRow = {
  name: string;
};

const globalForDatabase = globalThis as typeof globalThis & {
  bloom35Database?: Client;
  bloom35DatabaseInitialization?: Promise<void>;
  bloom35DatabaseSchemaVersion?: number;
};

const resolveLocalDatabasePath = () => {
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

const resolveDatabaseConfig = () => {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

  if (tursoUrl) {
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

    if (!authToken) {
      throw new Error(
        "TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is configured.",
      );
    }

    return {
      localPath: null,
      url: tursoUrl,
      authToken,
    };
  }

  const localPath = resolveLocalDatabasePath();

  return {
    localPath,
    url:
      localPath === ":memory:"
        ? "file::memory:"
        : pathToFileURL(path.resolve(localPath)).href,
    authToken: undefined,
  };
};

const databaseConfig = resolveDatabaseConfig();

const asRows = <RowType extends object>(result: ResultSet) =>
  result.rows as unknown as RowType[];

const execute = (
  database: Client,
  sql: string,
  args?: InArgs,
) => {
  const normalizedSql = sql.trim();

  const request =
    args === undefined
      ? database.execute(normalizedSql)
      : database.execute({ sql: normalizedSql, args });

  return request.catch((error) => {
    console.error("Database query failed.", {
      args,
      error,
      sql: normalizedSql,
    });
    throw error;
  });
};

const hasColumn = async (
  database: Client,
  tableName: string,
  columnName: string,
) => {
  const result = await execute(database, `PRAGMA table_info(${tableName});`);
  const columns = asRows<DatabaseColumnRow>(result);

  return columns.some((column) => column.name === columnName);
};

const ensureColumn = async (
  database: Client,
  tableName: string,
  columnName: string,
  sqlDefinition: string,
) => {
  if (!(await hasColumn(database, tableName, columnName))) {
    await execute(
      database,
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${sqlDefinition};`,
    );
  }
};

const schemaStatements = [
  `
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
  `,
  `
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
  `,
  `
    CREATE TABLE IF NOT EXISTS starter_guide_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      download_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_downloaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
] as const;

const initializeDatabase = async (database: Client) => {
  for (const statement of schemaStatements) {
    await execute(database, statement);
  }

  await ensureColumn(
    database,
    "affiliate_products",
    "note",
    "TEXT NOT NULL DEFAULT ''",
  );
  await ensureColumn(
    database,
    "affiliate_products",
    "is_featured",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await ensureColumn(
    database,
    "affiliate_products",
    "is_enabled",
    "INTEGER NOT NULL DEFAULT 1",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "breadcrumb",
    "TEXT NOT NULL DEFAULT ''",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "label",
    "TEXT NOT NULL DEFAULT 'Guide'",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "subtitle",
    "TEXT NOT NULL DEFAULT ''",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "author_name",
    "TEXT NOT NULL DEFAULT 'Bloom35 Editorial Team'",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "author_role",
    "TEXT NOT NULL DEFAULT 'Bloom35 editorial'",
  );
  await ensureColumn(
    database,
    "blog_posts",
    "content_json",
    "TEXT NOT NULL DEFAULT '{}'",
  );
  await ensureColumn(
    database,
    "starter_guide_downloads",
    "download_count",
    "INTEGER NOT NULL DEFAULT 1",
  );

  if (await hasColumn(database, "affiliate_products", "note")) {
    await execute(
      database,
      "UPDATE affiliate_products SET note = '' WHERE note <> '';",
    );
  }
};

const createDatabase = () => {
  if (databaseConfig.localPath && databaseConfig.localPath !== ":memory:") {
    mkdirSync(path.dirname(databaseConfig.localPath), { recursive: true });
  }

  return createClient({
    authToken: databaseConfig.authToken,
    url: databaseConfig.url,
  });
};

const ensureDatabaseInitialized = async (database: Client) => {
  if (globalForDatabase.bloom35DatabaseSchemaVersion === DATABASE_SCHEMA_VERSION) {
    return;
  }

  if (!globalForDatabase.bloom35DatabaseInitialization) {
    let initialization: Promise<void>;

    initialization = initializeDatabase(database)
      .then(() => {
        globalForDatabase.bloom35DatabaseSchemaVersion = DATABASE_SCHEMA_VERSION;
      })
      .finally(() => {
        if (globalForDatabase.bloom35DatabaseInitialization === initialization) {
          globalForDatabase.bloom35DatabaseInitialization = undefined;
        }
      });

    globalForDatabase.bloom35DatabaseInitialization = initialization;
  }

  await globalForDatabase.bloom35DatabaseInitialization;
};

export const getDatabase = async () => {
  if (!globalForDatabase.bloom35Database) {
    globalForDatabase.bloom35Database = createDatabase();
  }

  await ensureDatabaseInitialized(globalForDatabase.bloom35Database);

  return globalForDatabase.bloom35Database;
};

export const executeStatement = async (sql: string, args?: InArgs) => {
  const database = await getDatabase();

  return execute(database, sql, args);
};

export const queryRows = async <RowType extends object>(
  sql: string,
  args?: InArgs,
) => {
  const result = await executeStatement(sql, args);

  return asRows<RowType>(result);
};

export const queryRow = async <RowType extends object>(
  sql: string,
  args?: InArgs,
) => (await queryRows<RowType>(sql, args))[0];

export const closeDatabase = () => {
  globalForDatabase.bloom35Database?.close();
  globalForDatabase.bloom35Database = undefined;
  globalForDatabase.bloom35DatabaseInitialization = undefined;
  globalForDatabase.bloom35DatabaseSchemaVersion = undefined;
};
