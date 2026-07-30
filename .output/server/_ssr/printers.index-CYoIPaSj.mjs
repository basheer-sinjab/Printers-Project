import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Badge } from "./badge-CkD7adj2.mjs";
import { n as PRINTER_STATUS, r as STATUS_CLASS, s as formatDate } from "./pms-ALghGJ54.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as Search, p as Plus, s as Star } from "../_libs/lucide-react.mjs";
import { t as PrinterImage } from "./PrinterImage-WihmddPu.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Input, t as Button } from "./label-S2lCEF3z.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent } from "./select-Bd5-22nx.mjs";
import { n as useLookups, t as PrinterFormDialog } from "./PrinterFormDialog-BWxf1-GC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/printers.index-CYoIPaSj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ALL = "__all__";
function PrintersPage() {
	const { data: lookups } = useLookups();
	const [q, setQ] = (0, import_react.useState)("");
	const [branch, setBranch] = (0, import_react.useState)(ALL);
	const [dept, setDept] = (0, import_react.useState)(ALL);
	const [status, setStatus] = (0, import_react.useState)(ALL);
	const [manufacturer, setManufacturer] = (0, import_react.useState)(ALL);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const { data, isLoading } = useQuery({
		queryKey: ["printers-list"],
		queryFn: async () => {
			const [printers, changes] = await Promise.all([supabase.from("printers").select("*").order("asset_id"), supabase.from("toner_replacements").select("printer_id, change_date")]);
			const last = /* @__PURE__ */ new Map();
			for (const c of changes.data ?? []) {
				const prev = last.get(c.printer_id);
				if (!prev || c.change_date > prev) last.set(c.printer_id, c.change_date);
			}
			return {
				printers: printers.data ?? [],
				last
			};
		}
	});
	const manufacturers = (0, import_react.useMemo)(() => [...new Set((data?.printers ?? []).map((p) => p.manufacturer).filter(Boolean))], [data]);
	const filtered = (data?.printers ?? []).filter((p) => {
		const term = q.trim().toLowerCase();
		return (!term || [
			p.name,
			p.asset_id,
			p.serial_number,
			p.ip_address,
			p.model
		].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))) && (branch === ALL || p.branch_id === branch) && (dept === ALL || p.department_id === dept) && (status === ALL || p.status === status) && (manufacturer === ALL || p.manufacturer === manufacturer);
	});
	const nameOf = (list, id) => list?.find((x) => x.id === id)?.name ?? "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "الطابعات"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [filtered.length, " طابعة معروضة"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => setFormOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "إضافة طابعة"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-panel grid gap-3 p-4 md:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative md:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "pr-9",
							placeholder: "بحث بالاسم أو الرقم أو IP…",
							value: q,
							onChange: (e) => setQ(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
						value: branch,
						onChange: setBranch,
						placeholder: "كل الفروع",
						options: lookups?.branches
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
						value: dept,
						onChange: setDept,
						placeholder: "كل الأقسام",
						options: lookups?.departments
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: status,
						onValueChange: setStatus,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "كل الحالات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ALL,
							children: "كل الحالات"
						}), Object.entries(PRINTER_STATUS).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: k,
							children: v
						}, k))] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: manufacturer,
						onValueChange: setManufacturer,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "كل الشركات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ALL,
							children: "كل الشركات المصنّعة"
						}), manufacturers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: m,
							children: m
						}, m))] })]
					})
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "جارٍ التحميل…"
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "empty-state p-12 text-center text-muted-foreground",
				children: "لا توجد طابعات مطابقة."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
				children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/printers/$id",
					params: { id: p.id },
					className: "surface-panel interactive-card group overflow-hidden hover:interactive-card-hover",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterImage, {
								path: p.image_url,
								alt: p.name,
								className: "h-48 w-full"
							}),
							p.is_favorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "absolute top-3 left-3 size-5 fill-warning text-warning" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `absolute top-3 right-3 bg-card ${STATUS_CLASS[p.status]}`,
								children: PRINTER_STATUS[p.status]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted-foreground",
									dir: "ltr",
									children: p.asset_id
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: p.model || "بدون موديل"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid grid-cols-2 gap-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["القسم: ", nameOf(lookups?.departments, p.department_id)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["المسؤول: ", nameOf(lookups?.persons, p.responsible_person_id)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "border-t pt-2 text-xs text-muted-foreground",
								children: ["آخر تغيير حبر: ", formatDate(data?.last.get(p.id))]
							})
						]
					})]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterFormDialog, {
				open: formOpen,
				onOpenChange: setFormOpen
			})
		]
	});
}
function Filter({ value, onChange, placeholder, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: ALL,
			children: placeholder
		}), (options ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o.id,
			children: o.name
		}, o.id))] })]
	});
}
//#endregion
export { PrintersPage as component };
