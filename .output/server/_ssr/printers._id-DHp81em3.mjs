import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Badge } from "./badge-CkD7adj2.mjs";
import { l as today, n as PRINTER_STATUS, r as STATUS_CLASS, s as formatDate, t as MAINTENANCE_TYPES } from "./pms-ALghGJ54.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { T as ArrowLeftRight, m as Pencil, o as Trash2, p as Plus, s as Star, t as X, w as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as PrinterImage } from "./PrinterImage-WihmddPu.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./printers._id-BcXlWcWe.mjs";
import { n as Input, r as Label, t as Button } from "./label-S2lCEF3z.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CeyKuXzD.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as Textarea, r as DialogFooter, t as Dialog } from "./textarea-B4XbONgD.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as DateInput } from "./select-Bd5-22nx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useLookups, t as PrinterFormDialog } from "./PrinterFormDialog-BWxf1-GC.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DTHCV9bG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/printers._id-DHp81em3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CUSTOM = "__custom__";
function TonerHistoryTab({ printerId }) {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [date, setDate] = (0, import_react.useState)(today());
	const [notes, setNotes] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)([{
		tonerId: CUSTOM,
		customName: "",
		quantity: 1
	}]);
	const { data: toners } = useQuery({
		queryKey: ["toners"],
		queryFn: async () => (await supabase.from("toners").select("*").order("name")).data ?? []
	});
	const { data: history } = useQuery({
		queryKey: ["toner-history", printerId],
		queryFn: async () => (await supabase.from("toner_replacements").select("*, toner_replacement_items(*)").eq("printer_id", printerId).order("change_date", { ascending: false })).data ?? []
	});
	function reset() {
		setEditId(null);
		setDate(today());
		setNotes("");
		setItems([{
			tonerId: CUSTOM,
			customName: "",
			quantity: 1
		}]);
	}
	const save = useMutation({
		mutationFn: async () => {
			const clean = items.filter((i) => i.tonerId !== CUSTOM ? true : i.customName.trim());
			if (clean.length === 0) throw new Error("أضف حبرًا واحدًا على الأقل");
			let replacementId = editId;
			if (editId) {
				const { error } = await supabase.from("toner_replacements").update({
					change_date: date,
					notes: notes || null
				}).eq("id", editId);
				if (error) throw error;
				await supabase.from("toner_replacement_items").delete().eq("replacement_id", editId);
			} else {
				const { data, error } = await supabase.from("toner_replacements").insert({
					printer_id: printerId,
					change_date: date,
					notes: notes || null
				}).select("id").single();
				if (error) throw error;
				replacementId = data.id;
			}
			const rows = clean.map((i) => {
				const toner = toners?.find((t) => t.id === i.tonerId);
				return {
					replacement_id: replacementId,
					toner_id: toner ? toner.id : null,
					toner_name: toner ? toner.name : i.customName.trim(),
					quantity: Math.max(1, i.quantity)
				};
			});
			const { error: itemsError } = await supabase.from("toner_replacement_items").insert(rows);
			if (itemsError) throw itemsError;
			if (!editId) for (const r of rows) {
				if (!r.toner_id) continue;
				const toner = toners?.find((t) => t.id === r.toner_id);
				if (!toner) continue;
				await supabase.from("toners").update({ quantity: Math.max(0, toner.quantity - r.quantity) }).eq("id", toner.id);
			}
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حفظ عملية تغيير الحبر");
			setOpen(false);
			reset();
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("toner_replacements").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حذف السجل");
		}
	});
	function startEdit(record) {
		setEditId(record.id);
		setDate(record.change_date);
		setNotes(record.notes ?? "");
		setItems((record.toner_replacement_items ?? []).map((i) => ({
			tonerId: i.toner_id ?? CUSTOM,
			customName: i.toner_id ? "" : i.toner_name,
			quantity: i.quantity
		})));
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => {
						reset();
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "تسجيل تغيير حبر"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "التاريخ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الأحبار"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الكمية"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "ملاحظات"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "إجراءات"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(history ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-8 text-center text-muted-foreground",
					children: "لا توجد سجلات تغيير حبر."
				}) }), (history ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDate(r.change_date) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: (r.toner_replacement_items ?? []).map((i) => i.toner_name).join("، ") || "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: (r.toner_replacement_items ?? []).reduce((a, i) => a + i.quantity, 0) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: r.notes || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => startEdit(r),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => remove.mutate(r.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})]
					}) })
				] }, r.id))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] max-w-2xl overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editId ? "تعديل عملية تغيير حبر" : "تسجيل عملية تغيير حبر" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "التاريخ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
										value: date,
										onChange: setDate
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الأحبار المستخدمة" }),
										items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-end gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: item.tonerId,
														onValueChange: (v) => setItems((arr) => arr.map((x, i) => i === idx ? {
															...x,
															tonerId: v
														} : x)),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر الحبر" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [(toners ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
															value: t.id,
															children: [
																t.name,
																" (متوفر: ",
																t.quantity,
																")"
															]
														}, t.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: CUSTOM,
															children: "حبر غير موجود بالمخزون…"
														})] })]
													}), item.tonerId === CUSTOM && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "mt-2",
														placeholder: "اسم الحبر",
														value: item.customName,
														onChange: (e) => setItems((arr) => arr.map((x, i) => i === idx ? {
															...x,
															customName: e.target.value
														} : x))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 1,
													className: "w-24",
													value: item.quantity,
													onChange: (e) => setItems((arr) => arr.map((x, i) => i === idx ? {
														...x,
														quantity: Number(e.target.value)
													} : x))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													onClick: () => setItems((arr) => arr.filter((_, i) => i !== idx)),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
												})
											]
										}, idx)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											className: "gap-2",
											onClick: () => setItems((arr) => [...arr, {
												tonerId: CUSTOM,
												customName: "",
												quantity: 1
											}]),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "إضافة حبر آخر"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ملاحظات" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: notes,
										onChange: (e) => setNotes(e.target.value)
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
			})
		]
	});
}
function MaintenanceTab({ printerId }) {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [date, setDate] = (0, import_react.useState)(today());
	const [type, setType] = (0, import_react.useState)("repair");
	const [description, setDescription] = (0, import_react.useState)("");
	const [technician, setTechnician] = (0, import_react.useState)("");
	const [selectedParts, setSelectedParts] = (0, import_react.useState)([]);
	const [newPart, setNewPart] = (0, import_react.useState)("");
	const { data: parts } = useQuery({
		queryKey: ["parts"],
		queryFn: async () => (await supabase.from("parts").select("*").order("name")).data ?? []
	});
	const { data: records } = useQuery({
		queryKey: ["maintenance", printerId],
		queryFn: async () => (await supabase.from("maintenance_records").select("*").eq("printer_id", printerId).order("service_date", { ascending: false })).data ?? []
	});
	function reset() {
		setEditId(null);
		setDate(today());
		setType("repair");
		setDescription("");
		setTechnician("");
		setSelectedParts([]);
		setNewPart("");
	}
	const addPart = useMutation({
		mutationFn: async (name) => {
			const { error } = await supabase.from("parts").insert({ name });
			if (error) throw error;
		},
		onSuccess: (_d, name) => {
			qc.invalidateQueries({ queryKey: ["parts"] });
			setSelectedParts((p) => [...p, name]);
			setNewPart("");
		},
		onError: (e) => toast.error(e.message)
	});
	const save = useMutation({
		mutationFn: async () => {
			const payload = {
				printer_id: printerId,
				service_date: date,
				maintenance_type: type,
				description: description || null,
				technician: technician || null,
				replaced_parts: selectedParts
			};
			if (editId) {
				const { error } = await supabase.from("maintenance_records").update(payload).eq("id", editId);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("maintenance_records").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حفظ سجل الصيانة");
			setOpen(false);
			reset();
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حذف السجل");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => {
						reset();
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "إضافة صيانة"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "التاريخ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "نوع الصيانة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الوصف"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "القطع المستبدلة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الفني"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "إجراءات"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(records ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "py-8 text-center text-muted-foreground",
					children: "لا توجد سجلات صيانة."
				}) }), (records ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDate(r.service_date) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: MAINTENANCE_TYPES[r.maintenance_type] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "max-w-xs text-muted-foreground",
						children: r.description || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: (r.replaced_parts ?? []).length === 0 ? "—" : r.replaced_parts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: p
						}, p))
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.technician || "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => {
								setEditId(r.id);
								setDate(r.service_date);
								setType(r.maintenance_type);
								setDescription(r.description ?? "");
								setTechnician(r.technician ?? "");
								setSelectedParts(r.replaced_parts ?? []);
								setOpen(true);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => remove.mutate(r.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})]
					}) })
				] }, r.id))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] max-w-2xl overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editId ? "تعديل سجل صيانة" : "إضافة سجل صيانة" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "التاريخ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
										value: date,
										onChange: setDate
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "نوع الصيانة" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: type,
										onValueChange: (v) => setType(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(MAINTENANCE_TYPES).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: k,
											children: v
										}, k)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الوصف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: description,
										onChange: (e) => setDescription(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الفني" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: technician,
										onChange: (e) => setTechnician(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "القطع المستبدلة" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-2",
											children: selectedParts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "secondary",
												className: "gap-1",
												children: [p, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setSelectedParts((arr) => arr.filter((x) => x !== p)),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
												})]
											}, p))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: "",
											onValueChange: (v) => setSelectedParts((arr) => arr.includes(v) ? arr : [...arr, v]),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر قطعة من المكتبة" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (parts ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: p.name,
												children: p.name
											}, p.id)) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "إضافة قطعة جديدة للمكتبة",
												value: newPart,
												onChange: (e) => setNewPart(e.target.value)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												disabled: !newPart.trim(),
												onClick: () => addPart.mutate(newPart.trim()),
												children: "إضافة"
											})]
										})
									]
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
			})
		]
	});
}
function TransfersTab({ printer }) {
	const qc = useQueryClient();
	const { data: lookups } = useLookups();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [date, setDate] = (0, import_react.useState)(today());
	const [branch, setBranch] = (0, import_react.useState)("");
	const [dept, setDept] = (0, import_react.useState)("");
	const [person, setPerson] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	const { data: transfers } = useQuery({
		queryKey: ["transfers", printer.id],
		queryFn: async () => (await supabase.from("printer_transfers").select("*").eq("printer_id", printer.id).order("transfer_date", { ascending: false })).data ?? []
	});
	const save = useMutation({
		mutationFn: async () => {
			const deptName = lookups?.departments.find((d) => d.id === dept)?.name ?? null;
			const personName = lookups?.persons.find((x) => x.id === person)?.name ?? null;
			const { error } = await supabase.from("printer_transfers").insert({
				printer_id: printer.id,
				transfer_date: date,
				old_department: lookups?.departments.find((d) => d.id === printer.department_id)?.name ?? null,
				old_person: lookups?.persons.find((x) => x.id === printer.responsible_person_id)?.name ?? null,
				new_department: deptName,
				new_person: personName,
				notes: reason || null
			});
			if (error) throw error;
			const { error: upErr } = await supabase.from("printers").update({
				branch_id: branch || printer.branch_id,
				department_id: dept || printer.department_id,
				responsible_person_id: person || printer.responsible_person_id
			}).eq("id", printer.id);
			if (upErr) throw upErr;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم تسجيل النقل وتحديث موقع الطابعة");
			setOpen(false);
			setReason("");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => {
						setBranch(printer.branch_id ?? "");
						setDept(printer.department_id ?? "");
						setPerson(printer.responsible_person_id ?? "");
						setDate(today());
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "size-4" }), "نقل الطابعة"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-panel overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "التاريخ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "من"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "إلى"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "السبب"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(transfers ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 4,
					className: "py-8 text-center text-muted-foreground",
					children: "لا توجد عمليات نقل."
				}) }), (transfers ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatDate(t.transfer_date) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [t.old_department || "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: t.old_person || "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [t.new_department || "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: t.new_person || "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: t.notes || "—"
					})
				] }, t.id))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "نقل الطابعة" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "تاريخ النقل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
										value: date,
										onChange: setDate
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
									label: "الفرع الجديد",
									value: branch,
									onChange: setBranch,
									options: lookups?.branches
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
									label: "القسم الجديد",
									value: dept,
									onChange: setDept,
									options: lookups?.departments
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
									label: "المسؤول الجديد",
									value: person,
									onChange: setPerson,
									options: lookups?.persons
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "سبب النقل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 2,
										value: reason,
										onChange: (e) => setReason(e.target.value)
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
							children: "حفظ النقل"
						})] })
					]
				})
			})
		]
	});
}
function Picker({ label, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value,
			onValueChange: onChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (options ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: o.id,
				children: o.name
			}, o.id)) })]
		})]
	});
}
function PrinterDetails() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data: lookups } = useLookups();
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const { data: printer, isLoading } = useQuery({
		queryKey: ["printer", id],
		queryFn: async () => {
			const { data, error } = await supabase.from("printers").select("*").eq("id", id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const toggleFavorite = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("printers").update({ is_favorite: !printer?.is_favorite }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries()
	});
	const remove = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("printers").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("تم حذف الطابعة");
			navigate({ to: "/printers" });
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted-foreground",
		children: "جارٍ التحميل…"
	});
	if (!printer) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-panel p-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "الطابعة غير موجودة."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/printers",
			className: "mt-4 inline-block text-primary underline",
			children: "العودة للقائمة"
		})]
	});
	const nameOf = (list, key) => list?.find((x) => x.id === key)?.name ?? "—";
	const info = [
		["رقم الأصل", printer.asset_id],
		["الرقم التسلسلي", printer.serial_number || "—"],
		["الشركة المصنّعة", printer.manufacturer || "—"],
		["الموديل", printer.model || "—"],
		["الفرع", nameOf(lookups?.branches, printer.branch_id)],
		["القسم", nameOf(lookups?.departments, printer.department_id)],
		["الشخص المسؤول", nameOf(lookups?.persons, printer.responsible_person_id)],
		["عنوان IP", printer.ip_address || "—"],
		["تاريخ الشراء", formatDate(printer.purchase_date)],
		["انتهاء الضمان", formatDate(printer.warranty_expiry)],
		["ملاحظات", printer.notes || "—"]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/printers",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex items-center gap-2 text-2xl font-bold",
						children: [printer.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: STATUS_CLASS[printer.status],
							children: PRINTER_STATUS[printer.status]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm text-muted-foreground",
						dir: "ltr",
						children: printer.asset_id
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "gap-2",
							onClick: () => toggleFavorite.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-4 ${printer.is_favorite ? "fill-warning text-warning" : ""}` }), printer.is_favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "gap-2",
							onClick: () => setEditOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "تعديل"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "gap-2 text-destructive",
							onClick: () => {
								if (confirm("هل تريد حذف هذه الطابعة وكل سجلاتها؟")) remove.mutate();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "حذف"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "info",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "info",
							children: "البيانات الأساسية"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "toner",
							children: "سجل الأحبار"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "maintenance",
							children: "سجل الصيانة"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "transfers",
							children: "سجل النقل"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "info",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 lg:grid-cols-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "surface-panel overflow-hidden lg:col-span-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterImage, {
									path: printer.image_url,
									alt: printer.name,
									className: "h-64 w-full"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "surface-panel grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:col-span-2",
								children: info.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted-foreground",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 font-medium",
									children: value
								})] }, label))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "toner",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TonerHistoryTab, { printerId: printer.id })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "maintenance",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaintenanceTab, { printerId: printer.id })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "transfers",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransfersTab, { printer })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterFormDialog, {
				open: editOpen,
				onOpenChange: setEditOpen,
				printer
			})
		]
	});
}
//#endregion
export { PrinterDetails as component };
