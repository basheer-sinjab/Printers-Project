import { randomUUID } from "node:crypto";
import { basename, dirname, extname, join } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
var CAUSE_DEPTH_LIMIT = 5;
var DESCRIPTION_LENGTH_LIMIT = 8e3;
function describeError(error) {
	const parts = [];
	let current = error;
	for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
		if (!(current instanceof Error)) {
			parts.push(typeof current === "string" ? current : safeStringify(current));
			break;
		}
		const label = depth === 0 ? "" : "caused by: ";
		const status = describeStatus(current);
		parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
		current = current.cause;
	}
	return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}
function describeStatus(error) {
	const { status, statusCode } = error;
	const value = status ?? statusCode;
	return typeof value === "number" ? ` (status ${value})` : "";
}
function safeStringify(value) {
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
function isErrorLike(value) {
	return value instanceof Error;
}
var originalConsoleError = console.error.bind(console);
console.error = (...args) => {
	originalConsoleError(...args.map((arg) => {
		if (!isErrorLike(arg)) return arg;
		record(arg);
		return describeError(arg);
	}));
};
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var TABLES = /* @__PURE__ */ new Set([
	"branches",
	"departments",
	"responsible_persons",
	"parts",
	"suppliers",
	"toners",
	"toner_stock_entries",
	"printers",
	"toner_replacements",
	"toner_replacement_items",
	"maintenance_records",
	"printer_transfers",
	"app_settings"
]);
var PROJECT_DIRECTORY = process.env.INIT_CWD ?? process.cwd();
var DATABASE_PATH = join(PROJECT_DIRECTORY, "data", "printers.db");
var database;
var databaseReady;
async function getDatabase() {
	if (!databaseReady) databaseReady = mkdir(dirname(DATABASE_PATH), { recursive: true }).then(() => {
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
	return databaseReady;
}
function validateTable(table) {
	if (!TABLES.has(table)) throw new Error("جدول بيانات غير صالح");
}
function rowId(row) {
	if (row.id === void 0 || row.id === null) throw new Error("معرّف السجل مطلوب");
	return String(row.id);
}
async function readRows(table) {
	return (await getDatabase()).prepare("SELECT data FROM records WHERE table_name = ?").all(table).map(({ data }) => JSON.parse(String(data)));
}
function matches(row, filters) {
	return filters.every(([field, value]) => row[field] === value);
}
async function markMigrationComplete() {
	(await getDatabase()).prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES ('legacy_migration_complete', 'true')").run();
}
async function isMigrationComplete() {
	return (await getDatabase()).prepare("SELECT value FROM metadata WHERE key = 'legacy_migration_complete'").get() !== void 0;
}
async function runQuery(query) {
	validateTable(query.table);
	const db = await getDatabase();
	const filters = query.filters ?? [];
	let rows = await readRows(query.table);
	if (query.operation === "insert" || query.operation === "upsert") {
		const values = Array.isArray(query.payload) ? query.payload : [query.payload];
		if (!values.every(Boolean)) throw new Error("بيانات السجل مطلوبة");
		for (const value of values) db.prepare("INSERT OR REPLACE INTO records (table_name, id, data) VALUES (?, ?, ?)").run(query.table, rowId(value), JSON.stringify(value));
		rows = values;
		await markMigrationComplete();
	} else if (query.operation === "update") {
		if (!query.payload || Array.isArray(query.payload)) throw new Error("بيانات التحديث مطلوبة");
		rows = rows.filter((row) => matches(row, filters)).map((row) => ({
			...row,
			...query.payload
		}));
		for (const row of rows) db.prepare("UPDATE records SET data = ? WHERE table_name = ? AND id = ?").run(JSON.stringify(row), query.table, rowId(row));
		await markMigrationComplete();
	} else if (query.operation === "delete") {
		rows = rows.filter((row) => matches(row, filters));
		for (const row of rows) db.prepare("DELETE FROM records WHERE table_name = ? AND id = ?").run(query.table, rowId(row));
		await markMigrationComplete();
	} else {
		rows = rows.filter((row) => matches(row, filters));
		if (query.ordering) {
			const [field, ascending] = query.ordering;
			rows.sort((left, right) => String(left[field] ?? "").localeCompare(String(right[field] ?? "")) * (ascending ? 1 : -1));
		}
		if (query.take) rows = rows.slice(0, query.take);
	}
	return query.one ? rows[0] ?? null : rows;
}
async function exportData() {
	return Object.fromEntries(await Promise.all([...TABLES].map(async (table) => [table, await readRows(table)])));
}
async function restoreData(data) {
	for (const table of TABLES) if (!Array.isArray(data[table])) throw new Error("تحتوي النسخة الاحتياطية على بيانات غير صالحة");
	const db = await getDatabase();
	db.exec("BEGIN");
	try {
		db.prepare("DELETE FROM records").run();
		const insert = db.prepare("INSERT INTO records (table_name, id, data) VALUES (?, ?, ?)");
		for (const table of TABLES) for (const row of data[table]) insert.run(table, rowId(row), JSON.stringify(row));
		db.exec("COMMIT");
		await markMigrationComplete();
	} catch (error) {
		db.exec("ROLLBACK");
		throw error;
	}
}
function jsonResponse(data, status = 200) {
	return Response.json(data, { status });
}
async function handleLocalDataRequest(request) {
	const url = new URL(request.url);
	if (!url.pathname.startsWith("/api/local-data")) return null;
	try {
		if (url.pathname === "/api/local-data/status" && request.method === "GET") return jsonResponse({
			hasData: (await getDatabase()).prepare("SELECT 1 FROM records LIMIT 1").get() !== void 0,
			migrationComplete: await isMigrationComplete()
		});
		if (url.pathname === "/api/local-data/query" && request.method === "POST") return jsonResponse({
			data: await runQuery(await request.json()),
			error: null
		});
		if (url.pathname === "/api/local-data/export" && request.method === "GET") return jsonResponse({ data: await exportData() });
		if (url.pathname === "/api/local-data/restore" && request.method === "POST") {
			await restoreData(await request.json());
			return jsonResponse({ ok: true });
		}
		return new Response("Not found", { status: 404 });
	} catch (error) {
		return jsonResponse({ message: error instanceof Error ? error.message : "تعذر الوصول إلى قاعدة البيانات" }, 400);
	}
}
var UPLOADS_PATH = "/uploads/printers/";
var UPLOADS_DIRECTORY = join(process.cwd(), "uploads", "printers");
var MAX_IMAGE_SIZE = 10485760;
var mimeTypes = {
	".gif": "image/gif",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp"
};
function getFilename(path) {
	if (!path.startsWith(UPLOADS_PATH)) return null;
	const filename = path.slice(18);
	return filename && basename(filename) === filename ? filename : null;
}
function extensionFor(file) {
	const extension = extname(file.name).toLowerCase();
	if (mimeTypes[extension]) return extension;
	return Object.entries(mimeTypes).find(([, mimeType]) => mimeType === file.type)?.[0] ?? null;
}
function badRequest(message) {
	return new Response(JSON.stringify({ message }), {
		status: 400,
		headers: { "content-type": "application/json" }
	});
}
async function saveImage(file, requestedPath) {
	if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) throw new Error("يجب اختيار صورة لا يتجاوز حجمها 10 ميغابايت");
	const extension = extensionFor(file);
	if (!extension) throw new Error("صيغة الصورة غير مدعومة");
	const requestedFilename = requestedPath ? getFilename(requestedPath) : null;
	if (requestedPath && !requestedFilename) throw new Error("مسار الصورة غير صالح");
	const filename = requestedFilename ?? `${randomUUID()}${extension}`;
	await mkdir(UPLOADS_DIRECTORY, { recursive: true });
	await writeFile(join(UPLOADS_DIRECTORY, filename), Buffer.from(await file.arrayBuffer()));
	return `${UPLOADS_PATH}${filename}`;
}
async function handleLocalImageRequest(request) {
	const url = new URL(request.url);
	if (request.method === "GET" && url.pathname.startsWith(UPLOADS_PATH)) {
		const filename = getFilename(url.pathname);
		if (!filename) return new Response("Not found", { status: 404 });
		try {
			const contentType = mimeTypes[extname(filename).toLowerCase()];
			if (!contentType) return new Response("Not found", { status: 404 });
			const image = await readFile(join(UPLOADS_DIRECTORY, filename));
			return new Response(image, { headers: {
				"cache-control": "public, max-age=31536000, immutable",
				"content-type": contentType
			} });
		} catch {
			return new Response("Not found", { status: 404 });
		}
	}
	if (url.pathname === "/api/printer-images" && request.method === "POST") try {
		const image = (await request.formData()).get("image");
		if (!(image instanceof File)) return badRequest("لم يتم اختيار صورة");
		return Response.json({ path: await saveImage(image) }, { status: 201 });
	} catch (error) {
		return badRequest(error instanceof Error ? error.message : "تعذر رفع الصورة");
	}
	if (url.pathname === "/api/printer-images/restore" && request.method === "POST") try {
		const formData = await request.formData();
		const image = formData.get("image");
		const path = formData.get("path");
		if (!(image instanceof File) || typeof path !== "string") return badRequest("بيانات الاستعادة غير صالحة");
		return Response.json({ path: await saveImage(image, path) });
	} catch (error) {
		return badRequest(error instanceof Error ? error.message : "تعذر استعادة الصورة");
	}
	if (url.pathname === "/api/printer-images" && request.method === "DELETE") {
		const filename = getFilename(url.searchParams.get("path") ?? "");
		if (!filename) return badRequest("مسار الصورة غير صالح");
		try {
			await unlink(join(UPLOADS_DIRECTORY, filename));
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
		}
		return new Response(null, { status: 204 });
	}
	return null;
}
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-DDLK53d4.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
var server_default = { async fetch(request, env, ctx) {
	try {
		const dataResponse = await handleLocalDataRequest(request);
		if (dataResponse) return dataResponse;
		const imageResponse = await handleLocalImageRequest(request);
		if (imageResponse) return imageResponse;
		return await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx));
	} catch (error) {
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { server_default as default, renderErrorPage as t };
