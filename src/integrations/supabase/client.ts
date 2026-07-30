/**
 * Local data adapter.
 *
 * The UI was originally generated against Supabase.  This small compatibility
 * layer keeps that UI intact while storing records in the local SQLite file.
 * Printer image files are kept separately in uploads/printers.
 */
type Row = Record<string, any>;
type Result = { data: any; error: Error | null };

const LEGACY_DATABASE = "printers-manager-local";
const TABLES = [
  "branches", "departments", "responsible_persons", "parts", "suppliers",
  "toners", "toner_stock_entries", "printers", "toner_replacements",
  "toner_replacement_items", "maintenance_records", "printer_transfers", "app_settings",
] as const;
type TableName = (typeof TABLES)[number];
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

async function api<T>(path: string, init?: RequestInit) {
  const response = await fetch(`/api/local-data${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "تعذر الوصول إلى قاعدة البيانات");
  return body as T;
}

function readLegacyData(): Promise<Record<TableName, Row[]> | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(LEGACY_DATABASE);
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const database = request.result;
      const stores = TABLES.filter((table) => database.objectStoreNames.contains(table));
      if (stores.length === 0) {
        database.close();
        resolve(null);
        return;
      }

      const data = Object.fromEntries(TABLES.map((table) => [table, []])) as Record<TableName, Row[]>;
      const transaction = database.transaction(stores, "readonly");
      for (const table of stores) {
        const rows = transaction.objectStore(table).getAll();
        rows.onsuccess = () => { data[table] = rows.result as Row[]; };
        rows.onerror = () => resolve(null);
      }
      transaction.oncomplete = () => {
        database.close();
        resolve(data);
      };
      transaction.onerror = () => {
        database.close();
        resolve(null);
      };
    };
  });
}

let migrationPromise: Promise<void> | undefined;
async function migrateLegacyData() {
  const status = await api<{ hasData: boolean; migrationComplete: boolean }>("/status");
  if (status.hasData || status.migrationComplete) return;
  const data = await readLegacyData();
  if (data && Object.values(data).some((rows) => rows.length > 0)) {
    await api("/restore", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  }
}

function ensureLegacyMigration() {
  migrationPromise ??= migrateLegacyData();
  return migrationPromise;
}

function defaults(table: string, value: Row): Row {
  const base = { id: uuid(), created_at: now(), ...value };
  if (table === "printers") return { status: "active", is_favorite: false, asset_id: `PRN-${String(Date.now()).slice(-4)}`, updated_at: now(), ...base };
  if (table === "toners") return { color: "black", quantity: 0, min_quantity: 1, updated_at: now(), ...base };
  if (table === "maintenance_records") return { service_date: new Date().toISOString().slice(0, 10), maintenance_type: "repair", replaced_parts: [], ...base };
  if (table === "toner_replacements") return { change_date: new Date().toISOString().slice(0, 10), ...base };
  if (table === "toner_replacement_items") return { quantity: 1, ...base };
  if (table === "toner_stock_entries") return { entry_date: new Date().toISOString().slice(0, 10), ...base };
  if (table === "printer_transfers") return { transfer_date: new Date().toISOString().slice(0, 10), ...base };
  if (table === "app_settings") return { id: true, low_stock_threshold: 2, dashboard_alerts_enabled: true, warranty_alert_days: 30, updated_at: now(), ...value };
  return base;
}

class Query {
  private filters: Array<[string, any]> = [];
  private ordering?: [string, boolean]; private take?: number; private one = false; private selectText = "*";
  constructor(private table: string, private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select", private payload?: Row | Row[]) {}
  select(text = "*") { this.selectText = text; return this; }
  eq(field: string, value: any) { this.filters.push([field, value]); return this; }
  order(field: string, options?: { ascending?: boolean }) { this.ordering = [field, options?.ascending !== false]; return this; }
  limit(value: number) { this.take = value; return this; }
  single() { this.one = true; return this; }
  maybeSingle() { this.one = true; return this; }
  async execute(): Promise<Result> {
    try {
      await ensureLegacyMigration();
      const payload = this.operation === "insert"
        ? (Array.isArray(this.payload) ? this.payload : [this.payload!]).map((item) => defaults(this.table, item))
        : this.operation === "upsert" ? defaults(this.table, this.payload!) : this.payload;
      const response = await api<{ data: Row[] | Row | null }>("/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          table: this.table,
          operation: this.operation,
          payload,
          filters: this.filters,
          ordering: this.ordering,
          take: this.take,
          one: this.one,
        }),
      });
      let rows = response.data === null ? [] : Array.isArray(response.data) ? response.data : [response.data];
      if (this.operation === "select") {
        rows = await this.expand(rows);
        if (this.selectText !== "*" && !this.selectText.includes("(")) {
          const fields = this.selectText.split(",").map((x) => x.trim()); rows = rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]])));
        }
      }
      return { data: this.one ? (rows[0] ?? null) : rows, error: null };
    } catch (error) { return { data: null, error: error instanceof Error ? error : new Error(String(error)) }; }
  }
  private async expand(rows: Row[]) {
    if (this.table === "toner_replacements" && this.selectText.includes("toner_replacement_items")) {
      const items = await getRows("toner_replacement_items"); rows = rows.map((r) => ({ ...r, toner_replacement_items: items.filter((i) => i.replacement_id === r.id) }));
    }
    if ((this.table === "toner_replacements" || this.table === "maintenance_records") && this.selectText.includes("printers(")) {
      const printers = await getRows("printers"); rows = rows.map((r) => ({ ...r, printers: printers.find((p) => p.id === r.printer_id) ?? null }));
    }
    return rows;
  }
  then<TResult1 = Result, TResult2 = never>(ok?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null, fail?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null) { return this.execute().then(ok, fail); }
}

export const supabase: any = {
  from(table: string) { return { select: (text?: string) => new Query(table).select(text), insert: (value: Row | Row[]) => new Query(table, "insert", value), update: (value: Row) => new Query(table, "update", value), delete: () => new Query(table, "delete"), upsert: (value: Row) => new Query(table, "upsert", value) }; },
};

async function getRows(table: string) {
  const response = await api<{ data: Row[] }>("/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ table, operation: "select" }),
  });
  return response.data;
}

export async function exportLocalData(): Promise<Record<TableName, Row[]>> {
  await ensureLegacyMigration();
  return (await api<{ data: Record<TableName, Row[]> }>("/export")).data;
}

export async function restoreLocalData(data: Record<string, Row[]>) {
  await api("/restore", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
}
