import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as TONER_COLORS, n as PRINTER_STATUS, s as formatDate, t as MAINTENANCE_TYPES } from "./pms-ALghGJ54.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as Printer } from "../_libs/lucide-react.mjs";
import { r as Label, t as Button } from "./label-S2lCEF3z.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as DateInput } from "./select-Bd5-22nx.mjs";
import { n as useLookups } from "./PrinterFormDialog-BWxf1-GC.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DTHCV9bG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-DXAoaefD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ALL = "__all__";
var REPORTS = [
	{
		value: "printers",
		label: "تقرير الطابعات"
	},
	{
		value: "toners",
		label: "تقرير مخزون الأحبار"
	},
	{
		value: "maintenance",
		label: "تقرير الصيانة"
	},
	{
		value: "toner-usage",
		label: "تقرير استهلاك الأحبار"
	}
];
function ReportsPage() {
	const { data: lookups } = useLookups();
	const [kind, setKind] = (0, import_react.useState)("printers");
	const [branch, setBranch] = (0, import_react.useState)(ALL);
	const [dept, setDept] = (0, import_react.useState)(ALL);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const { data } = useQuery({
		queryKey: ["report-data"],
		queryFn: async () => {
			const [printers, toners, maintenance, replacements] = await Promise.all([
				supabase.from("printers").select("*").order("asset_id"),
				supabase.from("toners").select("*").order("name"),
				supabase.from("maintenance_records").select("*").order("service_date", { ascending: false }),
				supabase.from("toner_replacements").select("*, toner_replacement_items(*)").order("change_date", { ascending: false })
			]);
			return {
				printers: printers.data ?? [],
				toners: toners.data ?? [],
				maintenance: maintenance.data ?? [],
				replacements: replacements.data ?? []
			};
		}
	});
	const nameOf = (list, id) => list?.find((x) => x.id === id)?.name ?? "—";
	const printers = (data?.printers ?? []).filter((p) => (branch === ALL || p.branch_id === branch) && (dept === ALL || p.department_id === dept));
	const printerIds = new Set(printers.map((p) => p.id));
	const inRange = (d) => (!from || d >= from) && (!to || d <= to);
	const maintenance = (data?.maintenance ?? []).filter((m) => printerIds.has(m.printer_id) && inRange(m.service_date));
	const replacements = (data?.replacements ?? []).filter((r) => printerIds.has(r.printer_id) && inRange(r.change_date));
	const usage = /* @__PURE__ */ new Map();
	for (const r of replacements) for (const i of r.toner_replacement_items ?? []) usage.set(i.toner_name, (usage.get(i.toner_name) ?? 0) + i.quantity);
	const title = REPORTS.find((r) => r.value === kind).label;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "no-print flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "التقارير"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "اختر نوع التقرير ثم اطبعه أو احفظه كملف PDF"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => window.print(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), "طباعة / حفظ PDF"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print surface-panel grid gap-4 p-4 md:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "نوع التقرير" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: kind,
							onValueChange: (v) => setKind(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: REPORTS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: r.value,
								children: r.label
							}, r.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الفرع" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: branch,
							onValueChange: setBranch,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "كل الفروع"
							}), (lookups?.branches ?? []).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: b.id,
								children: b.name
							}, b.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "القسم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: dept,
							onValueChange: setDept,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "كل الأقسام"
							}), (lookups?.departments ?? []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d.id,
								children: d.name
							}, d.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "من تاريخ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
							value: from,
							onChange: setFrom
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "إلى تاريخ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
							value: to,
							onChange: setTo
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-panel space-y-4 p-6 print:border-0 print:shadow-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between border-b pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: formatDate((/* @__PURE__ */ new Date()).toISOString())
						})]
					}),
					kind === "printers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportTable, {
						head: [
							"رقم الأصل",
							"الاسم",
							"الموديل",
							"الفرع",
							"القسم",
							"المسؤول",
							"الحالة"
						],
						rows: printers.map((p) => [
							p.asset_id,
							p.name,
							p.model || "—",
							nameOf(lookups?.branches, p.branch_id),
							nameOf(lookups?.departments, p.department_id),
							nameOf(lookups?.persons, p.responsible_person_id),
							PRINTER_STATUS[p.status]
						])
					}),
					kind === "toners" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportTable, {
						head: [
							"الحبر",
							"الكود",
							"اللون",
							"الكمية",
							"الحد الأدنى",
							"الحالة"
						],
						rows: (data?.toners ?? []).map((t) => [
							t.name,
							t.code || "—",
							TONER_COLORS[t.color],
							String(t.quantity),
							String(t.min_quantity),
							t.quantity <= t.min_quantity ? "نقص" : "متوفر"
						])
					}),
					kind === "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportTable, {
						head: [
							"التاريخ",
							"الطابعة",
							"النوع",
							"الوصف",
							"القطع",
							"الفني"
						],
						rows: maintenance.map((m) => [
							formatDate(m.service_date),
							printers.find((p) => p.id === m.printer_id)?.name ?? "—",
							MAINTENANCE_TYPES[m.maintenance_type],
							m.description || "—",
							(m.replaced_parts ?? []).join("، ") || "—",
							m.technician || "—"
						])
					}),
					kind === "toner-usage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportTable, {
						head: ["الحبر", "إجمالي الاستهلاك"],
						rows: [...usage.entries()].sort((a, b) => b[1] - a[1]).map(([name, qty]) => [name, String(qty)])
					})
				]
			})
		]
	});
}
function ReportTable({ head, rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-muted-foreground",
		children: "لا توجد بيانات ضمن هذا التصفية."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: head.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
		className: "text-right",
		children: h
	}, h)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: r.map((c, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c }, j)) }, i)) })] });
}
//#endregion
export { ReportsPage as component };
