import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { m as Pencil, o as Trash2, p as Plus } from "../_libs/lucide-react.mjs";
import { n as Input, r as Label, t as Button } from "./label-S2lCEF3z.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as Textarea, r as DialogFooter, t as Dialog } from "./textarea-B4XbONgD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DTHCV9bG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/suppliers-Coxn7k5V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	name: "",
	contact_person: "",
	phone: "",
	email: "",
	notes: ""
};
function SuppliersPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty);
	const { data: suppliers } = useQuery({
		queryKey: ["suppliers"],
		queryFn: async () => (await supabase.from("suppliers").select("*").order("name")).data ?? []
	});
	const { data: toners } = useQuery({
		queryKey: ["toners"],
		queryFn: async () => (await supabase.from("toners").select("*")).data ?? []
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!form.name.trim()) throw new Error("اسم المورد مطلوب");
			const payload = {
				name: form.name.trim(),
				contact_person: form.contact_person || null,
				phone: form.phone || null,
				email: form.email || null,
				notes: form.notes || null
			};
			const { error } = editId ? await supabase.from("suppliers").update(payload).eq("id", editId) : await supabase.from("suppliers").insert(payload);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم حفظ المورد");
			setOpen(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("suppliers").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success("تم الحذف");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "الموردون"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [(suppliers ?? []).length, " مورد مسجل"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-2",
					onClick: () => {
						setEditId(null);
						setForm(empty);
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "إضافة مورد"]
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
						children: "مسؤول التواصل"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الهاتف"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "البريد"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "الأحبار المرتبطة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "إجراءات"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(suppliers ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "py-8 text-center text-muted-foreground",
					children: "لا يوجد موردون."
				}) }), (suppliers ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: s.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: s.contact_person || "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						dir: "ltr",
						className: "text-right font-mono text-sm",
						children: s.phone || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						dir: "ltr",
						className: "text-right text-sm",
						children: s.email || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: (toners ?? []).filter((t) => t.supplier_id === s.id).length }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => {
								setEditId(s.id);
								setForm({
									name: s.name,
									contact_person: s.contact_person ?? "",
									phone: s.phone ?? "",
									email: s.email ?? "",
									notes: s.notes ?? ""
								});
								setOpen(true);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => remove.mutate(s.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})]
					}) })
				] }, s.id))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editId ? "تعديل مورد" : "إضافة مورد" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "اسم المورد" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "مسؤول التواصل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.contact_person,
										onChange: (e) => setForm({
											...form,
											contact_person: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "الهاتف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										value: form.phone,
										onChange: (e) => setForm({
											...form,
											phone: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "البريد الإلكتروني" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										type: "email",
										value: form.email,
										onChange: (e) => setForm({
											...form,
											email: e.target.value
										})
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
			})
		]
	});
}
//#endregion
export { SuppliersPage as component };
