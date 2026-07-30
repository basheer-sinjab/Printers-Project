import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-0-yik925.js
var LEGACY_DATABASE = "printers-manager-local";
var TABLES = [
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
];
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var uuid = () => crypto.randomUUID();
async function api(path, init) {
	const response = await fetch(`/api/local-data${path}`, init);
	const body = await response.json();
	if (!response.ok) throw new Error(body.message ?? "تعذر الوصول إلى قاعدة البيانات");
	return body;
}
function readLegacyData() {
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
			const data = Object.fromEntries(TABLES.map((table) => [table, []]));
			const transaction = database.transaction(stores, "readonly");
			for (const table of stores) {
				const rows = transaction.objectStore(table).getAll();
				rows.onsuccess = () => {
					data[table] = rows.result;
				};
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
var migrationPromise;
async function migrateLegacyData() {
	const status = await api("/status");
	if (status.hasData || status.migrationComplete) return;
	const data = await readLegacyData();
	if (data && Object.values(data).some((rows) => rows.length > 0)) await api("/restore", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data)
	});
}
function ensureLegacyMigration() {
	migrationPromise ??= migrateLegacyData();
	return migrationPromise;
}
function defaults(table, value) {
	const base = {
		id: uuid(),
		created_at: now(),
		...value
	};
	if (table === "printers") return {
		status: "active",
		is_favorite: false,
		asset_id: `PRN-${String(Date.now()).slice(-4)}`,
		updated_at: now(),
		...base
	};
	if (table === "toners") return {
		color: "black",
		quantity: 0,
		min_quantity: 1,
		updated_at: now(),
		...base
	};
	if (table === "maintenance_records") return {
		service_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		maintenance_type: "repair",
		replaced_parts: [],
		...base
	};
	if (table === "toner_replacements") return {
		change_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		...base
	};
	if (table === "toner_replacement_items") return {
		quantity: 1,
		...base
	};
	if (table === "toner_stock_entries") return {
		entry_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		...base
	};
	if (table === "printer_transfers") return {
		transfer_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		...base
	};
	if (table === "app_settings") return {
		id: true,
		low_stock_threshold: 2,
		dashboard_alerts_enabled: true,
		warranty_alert_days: 30,
		updated_at: now(),
		...value
	};
	return base;
}
var Query = class {
	table;
	operation;
	payload;
	filters = [];
	ordering;
	take;
	one = false;
	selectText = "*";
	constructor(table, operation = "select", payload) {
		this.table = table;
		this.operation = operation;
		this.payload = payload;
	}
	select(text = "*") {
		this.selectText = text;
		return this;
	}
	eq(field, value) {
		this.filters.push([field, value]);
		return this;
	}
	order(field, options) {
		this.ordering = [field, options?.ascending !== false];
		return this;
	}
	limit(value) {
		this.take = value;
		return this;
	}
	single() {
		this.one = true;
		return this;
	}
	maybeSingle() {
		this.one = true;
		return this;
	}
	async execute() {
		try {
			await ensureLegacyMigration();
			const payload = this.operation === "insert" ? (Array.isArray(this.payload) ? this.payload : [this.payload]).map((item) => defaults(this.table, item)) : this.operation === "upsert" ? defaults(this.table, this.payload) : this.payload;
			const response = await api("/query", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					table: this.table,
					operation: this.operation,
					payload,
					filters: this.filters,
					ordering: this.ordering,
					take: this.take,
					one: this.one
				})
			});
			let rows = response.data === null ? [] : Array.isArray(response.data) ? response.data : [response.data];
			if (this.operation === "select") {
				rows = await this.expand(rows);
				if (this.selectText !== "*" && !this.selectText.includes("(")) {
					const fields = this.selectText.split(",").map((x) => x.trim());
					rows = rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]])));
				}
			}
			return {
				data: this.one ? rows[0] ?? null : rows,
				error: null
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error(String(error))
			};
		}
	}
	async expand(rows) {
		if (this.table === "toner_replacements" && this.selectText.includes("toner_replacement_items")) {
			const items = await getRows("toner_replacement_items");
			rows = rows.map((r) => ({
				...r,
				toner_replacement_items: items.filter((i) => i.replacement_id === r.id)
			}));
		}
		if ((this.table === "toner_replacements" || this.table === "maintenance_records") && this.selectText.includes("printers(")) {
			const printers = await getRows("printers");
			rows = rows.map((r) => ({
				...r,
				printers: printers.find((p) => p.id === r.printer_id) ?? null
			}));
		}
		return rows;
	}
	then(ok, fail) {
		return this.execute().then(ok, fail);
	}
};
var supabase = { from(table) {
	return {
		select: (text) => new Query(table).select(text),
		insert: (value) => new Query(table, "insert", value),
		update: (value) => new Query(table, "update", value),
		delete: () => new Query(table, "delete"),
		upsert: (value) => new Query(table, "upsert", value)
	};
} };
async function getRows(table) {
	return (await api("/query", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			table,
			operation: "select"
		})
	})).data;
}
async function exportLocalData() {
	await ensureLegacyMigration();
	return (await api("/export")).data;
}
async function restoreLocalData(data) {
	await api("/restore", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data)
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { supabase as i, exportLocalData as n, restoreLocalData as r, cn as t };
