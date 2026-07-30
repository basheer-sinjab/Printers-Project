import { mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";

type Row = Record<string, unknown>;
type Operation = "select" | "insert" | "update" | "delete" | "upsert";
type QueryRequest = {
  table: string;
  operation: Operation;
  payload?: Row | Row[];
  filters?: Array<[string, unknown]>;
  ordering?: [string, boolean];
  take?: number;
  one?: boolean;
};

const TABLES = new Set([
  "branches", "departments", "responsible_persons", "parts", "suppliers",
  "toners", "toner_stock_entries", "printers", "toner_replacements",
  "toner_replacement_items", "maintenance_records", "printer_transfers", "app_settings",
]);
const PROJECT_DIRECTORY = process.env.INIT_CWD ?? process.cwd();
const DATABASE_PATH = join(PROJECT_DIRECTORY, "data", "printers.db");
let database: DatabaseSync | undefined;
let databaseReady: Promise<DatabaseSync> | undefined;

async function getDatabase() {
  if (!databaseReady) {
    databaseReady = mkdir(dirname(DATABASE_PATH), { recursive: true }).then(() => {
      database = new DatabaseSync(DATABASE_PATH);
      database.exec(`
        CREATE TABLE IF NOT EXISTS records (
          table_name TEXT NOT NULL,
          id TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (table_name, id)
        )
      `);
      database.exec(`
        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);
      return database;
    });
  }
  return databaseReady;
}

function validateTable(table: string) {
  if (!TABLES.has(table)) throw new Error("جدول بيانات غير صالح");
}

function rowId(row: Row) {
  if (row.id === undefined || row.id === null) throw new Error("معرّف السجل مطلوب");
  return String(row.id);
}

async function readRows(table: string) {
  const db = await getDatabase();
  return db.prepare("SELECT data FROM records WHERE table_name = ?").all(table)
    .map(({ data }) => JSON.parse(String(data)) as Row);
}

function matches(row: Row, filters: Array<[string, unknown]>) {
  return filters.every(([field, value]) => row[field] === value);
}

async function markMigrationComplete() {
  const db = await getDatabase();
  db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES ('legacy_migration_complete', 'true')").run();
}

async function isMigrationComplete() {
  const db = await getDatabase();
  return db.prepare("SELECT value FROM metadata WHERE key = 'legacy_migration_complete'").get() !== undefined;
}

async function runQuery(query: QueryRequest) {
  validateTable(query.table);
  const db = await getDatabase();
  const filters = query.filters ?? [];
  let rows = await readRows(query.table);

  if (query.operation === "insert" || query.operation === "upsert") {
    const values = Array.isArray(query.payload) ? query.payload : [query.payload];
    if (!values.every(Boolean)) throw new Error("بيانات السجل مطلوبة");
    for (const value of values as Row[]) {
      db.prepare("INSERT OR REPLACE INTO records (table_name, id, data) VALUES (?, ?, ?)")
        .run(query.table, rowId(value), JSON.stringify(value));
    }
    rows = values as Row[];
    await markMigrationComplete();
  } else if (query.operation === "update") {
    if (!query.payload || Array.isArray(query.payload)) throw new Error("بيانات التحديث مطلوبة");
    rows = rows.filter((row) => matches(row, filters)).map((row) => ({ ...row, ...query.payload }));
    for (const row of rows) {
      db.prepare("UPDATE records SET data = ? WHERE table_name = ? AND id = ?")
        .run(JSON.stringify(row), query.table, rowId(row));
    }
    await markMigrationComplete();
  } else if (query.operation === "delete") {
    rows = rows.filter((row) => matches(row, filters));
    for (const row of rows) {
      db.prepare("DELETE FROM records WHERE table_name = ? AND id = ?").run(query.table, rowId(row));
    }
    await markMigrationComplete();
  } else {
    rows = rows.filter((row) => matches(row, filters));
    if (query.ordering) {
      const [field, ascending] = query.ordering;
      rows.sort((left, right) => String(left[field] ?? "").localeCompare(String(right[field] ?? "")) * (ascending ? 1 : -1));
    }
    if (query.take) rows = rows.slice(0, query.take);
  }

  return query.one ? (rows[0] ?? null) : rows;
}

async function exportData() {
  return Object.fromEntries(await Promise.all([...TABLES].map(async (table) => [table, await readRows(table)])));
}

async function restoreData(data: Record<string, Row[]>) {
  for (const table of TABLES) {
    if (!Array.isArray(data[table])) throw new Error("تحتوي النسخة الاحتياطية على بيانات غير صالحة");
  }

  const db = await getDatabase();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM records").run();
    const insert = db.prepare("INSERT INTO records (table_name, id, data) VALUES (?, ?, ?)");
    for (const table of TABLES) {
      for (const row of data[table]) insert.run(table, rowId(row), JSON.stringify(row));
    }
    db.exec("COMMIT");
    await markMigrationComplete();
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function handleLocalDataRequest(request: Request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/local-data")) return null;

  try {
    if (url.pathname === "/api/local-data/status" && request.method === "GET") {
      const hasData = (await getDatabase()).prepare("SELECT 1 FROM records LIMIT 1").get() !== undefined;
      return jsonResponse({ hasData, migrationComplete: await isMigrationComplete() });
    }

    if (url.pathname === "/api/local-data/query" && request.method === "POST") {
      return jsonResponse({ data: await runQuery(await request.json() as QueryRequest), error: null });
    }

    if (url.pathname === "/api/local-data/export" && request.method === "GET") {
      return jsonResponse({ data: await exportData() });
    }

    if (url.pathname === "/api/local-data/restore" && request.method === "POST") {
      await restoreData(await request.json() as Record<string, Row[]>);
      return jsonResponse({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  } catch (error) {
    return jsonResponse({ message: error instanceof Error ? error.message : "تعذر الوصول إلى قاعدة البيانات" }, 400);
  }
}
