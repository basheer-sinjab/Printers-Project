import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Badge } from "./badge-CkD7adj2.mjs";
import { i as TONER_COLORS, l as today, s as formatDate } from "./pms-ALghGJ54.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { d as Search, h as PackagePlus, m as Pencil, o as Trash2, p as Plus } from "../_libs/lucide-react.mjs";
import { n as Input, r as Label, t as Button } from "./label-S2lCEF3z.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as Textarea, r as DialogFooter, t as Dialog } from "./textarea-B4XbONgD.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as DateInput } from "./select-Bd5-22nx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DTHCV9bG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/toners--_kd9BlQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyToner = {
	name: "",
	code: "",
	color: "black",
	quantity: 0,
	min_quantity: 2,
	supplier_id: "",
	notes: ""
};
function TonersPage() {
	const qc = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(emptyToner);
	const [stockFor, setStockFor] = (0, import_react.useState)(null);
	const [stockQty, setStockQty] = (0, import_react.useState)(1);
	const [stockDate, setStockDate] = (0, import_react.useState)(today());
	const [stockNotes, setStockNotes] = (0, import_react.useState)("");
	const { data: suppliers } = useQuery({
		queryKey: ["suppliers"],
		queryFn: async () => (await supabase.from("suppliers").select("*").order("name")).data ?? []
	});
	const { data: toners } = useQuery({
		queryKey: ["toners"],
		queryFn: async () => (await supabase.from("toners").select("*").order("name")).data ?? []
	});
	const { data: entries } = useQuery({
		queryKey: ["toner-entries"],
		queryFn: async () => (await supabase.from("toner_stock_entries").select("*").order("entry_date", { ascending: false }).limit(30)).data ?? []
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!form.name.trim()) throw new Error("اسم الحبر مطلوب");
			const payload = {
				name: form.name.trim(),
				code: form.code || null,
				color: form.color,
				quantity: Number(form.quantity) || 0,
				min_quantity: Number(form.min_quantity) || 0,
				supplier_id: form.supplier_id || null,
				notes: form.notes || null
			};
			const { error } = editId ? await supabase.from("toners").update(payload).eq("id", editId) : await supabase.from("toners").insert(payload);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حفظ الحبر");
			setOpen(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("toners").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم الحذف");
		},
		onError: (e) => toast.error(e.message)
	});
	const addStock = useMutation({
		mutationFn: async () => {
			if (!stockFor) return;
			const qty = Math.max(1, Number(stockQty));
			const { error } = await supabase.from("toner_stock_entries").insert({
				toner_id: stockFor.id,
				quantity: qty,
				entry_date: stockDate,
				notes: stockNotes || null
			});
			if (error) throw error;
			const { error: upErr } = await supabase.from("toners").update({ quantity: stockFor.quantity + qty }).eq("id", stockFor.id);
			if (upErr) throw upErr;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تمت إضافة الكمية للمخزون");
			setStockFor(null);
			setStockQty(1);
			setStockNotes("");
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = (toners ?? []).filter((t) => [t.name, t.code].filter(Boolean).some((v) => String(v).toLowerCase().includes(q.toLowerCase())));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "مخزون الأحبار"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						filtered.length,
						" نوع حبر · ",
						filtered.filter((t) => t.quantity <= t.min_quantity).length,
						" تحت الحد الأدنى"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => {
						setEditId(null);
						setForm(emptyToner);
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "إضافة حبر"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "pr-9",
					placeholder: "بحث بالاسم أو الكود…",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الاسم"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الكود"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "اللون"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الكمية"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الحد الأدنى"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "المورد"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "إجراءات"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "py-8 text-center text-muted-foreground",
					children: "لا توجد أحبار مسجلة."
				}) }), filtered.map((t) => {
					const low = t.quantity <= t.min_quantity;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: t.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							dir: "ltr",
							children: t.code || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: TONER_COLORS[t.color] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: low ? "destructive" : "secondary",
							children: t.quantity
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: t.min_quantity }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: suppliers?.find((s) => s.id === t.supplier_id)?.name ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									title: "إضافة كمية",
									onClick: () => {
										setStockFor({
											id: t.id,
											name: t.name,
											quantity: t.quantity
										});
										setStockDate(today());
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackagePlus, { className: "size-4 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => {
										setEditId(t.id);
										setForm({
											name: t.name,
											code: t.code ?? "",
											color: t.color,
											quantity: t.quantity,
											min_quantity: t.min_quantity,
											supplier_id: t.supplier_id ?? "",
											notes: t.notes ?? ""
										});
										setOpen(true);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: () => remove.mutate(t.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
								})
							]
						}) })
					] }, t.id);
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "آخر إدخالات المخزون"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "surface-panel overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "التاريخ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "الحبر"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "الكمية"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "ملاحظات"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(entries ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 4,
						className: "py-8 text-center text-muted-foreground",
						children: "لا توجد إدخالات."
					}) }), (entries ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDate(e.entry_date) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: toners?.find((t) => t.id === e.toner_id)?.name ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: ["+", e.quantity] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-muted-foreground",
							children: e.notes || "—"
						})
					] }, e.id))] })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editId ? "تعديل حبر" : "إضافة حبر" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الاسم" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الكود" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.code,
										onChange: (e) => setForm({
											...form,
											code: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "اللون" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.color,
										onValueChange: (v) => setForm({
											...form,
											color: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(TONER_COLORS).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: k,
											children: v
										}, k)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الكمية" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										value: form.quantity,
										onChange: (e) => setForm({
											...form,
											quantity: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "حد التنبيه" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										value: form.min_quantity,
										onChange: (e) => setForm({
											...form,
											min_quantity: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "المورد" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.supplier_id,
										onValueChange: (v) => setForm({
											...form,
											supplier_id: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر المورد" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (suppliers ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: s.id,
											children: s.name
										}, s.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ملاحظات" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: form.notes,
										onChange: (e) => setForm({
											...form,
											notes: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "إلغاء"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => save.mutate(),
							disabled: save.isPending,
							children: "حفظ"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!stockFor,
				onOpenChange: (o) => !o && setStockFor(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["إضافة كمية — ", stockFor?.name] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "التاريخ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
										value: stockDate,
										onChange: setStockDate
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الكمية المضافة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										value: stockQty,
										onChange: (e) => setStockQty(Number(e.target.value))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ملاحظات" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: stockNotes,
										onChange: (e) => setStockNotes(e.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setStockFor(null),
							children: "إلغاء"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => addStock.mutate(),
							disabled: addStock.isPending,
							children: "إضافة"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { TonersPage as component };
