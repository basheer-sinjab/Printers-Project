import { r as __toESM } from "../_runtime.mjs";
import { i as supabase } from "./utils-0-yik925.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as PRINTER_STATUS, o as deletePrinterImage, u as uploadPrinterImage } from "./pms-ALghGJ54.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as PrinterImage } from "./PrinterImage-WihmddPu.mjs";
import { n as Input, r as Label, t as Button } from "./label-S2lCEF3z.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as Textarea, r as DialogFooter, t as Dialog } from "./textarea-B4XbONgD.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as DateInput } from "./select-Bd5-22nx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PrinterFormDialog-BWxf1-GC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NONE = "__none__";
var EMPTY = {
	asset_id: "",
	name: "",
	manufacturer: "",
	model: "",
	printer_type: "",
	serial_number: "",
	ip_address: "",
	mac_address: "",
	branch_id: NONE,
	department_id: NONE,
	responsible_person_id: NONE,
	status: "active",
	purchase_date: "",
	warranty_expiry: "",
	notes: ""
};
function useLookups() {
	return useQuery({
		queryKey: ["lookups"],
		queryFn: async () => {
			const [branches, departments, persons, parts, suppliers] = await Promise.all([
				supabase.from("branches").select("*").order("name"),
				supabase.from("departments").select("*").order("name"),
				supabase.from("responsible_persons").select("*").order("name"),
				supabase.from("parts").select("*").order("name"),
				supabase.from("suppliers").select("*").order("name")
			]);
			return {
				branches: branches.data ?? [],
				departments: departments.data ?? [],
				persons: persons.data ?? [],
				parts: parts.data ?? [],
				suppliers: suppliers.data ?? []
			};
		}
	});
}
function PrinterFormDialog({ open, onOpenChange, printer }) {
	const qc = useQueryClient();
	const { data: lookups } = useLookups();
	const [form, setForm] = (0, import_react.useState)({ ...EMPTY });
	const [file, setFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (printer) setForm({
			asset_id: printer.asset_id,
			name: printer.name,
			manufacturer: printer.manufacturer ?? "",
			model: printer.model ?? "",
			printer_type: printer.printer_type ?? "",
			serial_number: printer.serial_number ?? "",
			ip_address: printer.ip_address ?? "",
			mac_address: printer.mac_address ?? "",
			branch_id: printer.branch_id ?? NONE,
			department_id: printer.department_id ?? NONE,
			responsible_person_id: printer.responsible_person_id ?? NONE,
			status: printer.status,
			purchase_date: printer.purchase_date ?? "",
			warranty_expiry: printer.warranty_expiry ?? "",
			notes: printer.notes ?? ""
		});
		else setForm({ ...EMPTY });
		setFile(null);
	}, [open, printer]);
	(0, import_react.useEffect)(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);
	const save = useMutation({
		mutationFn: async () => {
			if (!form.name.trim()) throw new Error("اسم الطابعة مطلوب");
			let imagePath = printer?.image_url ?? null;
			if (file) imagePath = await uploadPrinterImage(file);
			const payload = {
				name: form.name.trim(),
				manufacturer: form.manufacturer || null,
				model: form.model || null,
				printer_type: form.printer_type || null,
				serial_number: form.serial_number || null,
				ip_address: form.ip_address || null,
				mac_address: form.mac_address || null,
				branch_id: form.branch_id === NONE ? null : form.branch_id,
				department_id: form.department_id === NONE ? null : form.department_id,
				responsible_person_id: form.responsible_person_id === NONE ? null : form.responsible_person_id,
				status: form.status,
				purchase_date: form.purchase_date || null,
				warranty_expiry: form.warranty_expiry || null,
				notes: form.notes || null,
				image_url: imagePath
			};
			if (form.asset_id.trim()) payload.asset_id = form.asset_id.trim();
			if (printer) {
				const { error } = await supabase.from("printers").update(payload).eq("id", printer.id);
				if (error) throw error;
				if (file && printer.image_url && printer.image_url !== imagePath) await deletePrinterImage(printer.image_url);
			} else {
				const { error } = await supabase.from("printers").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries();
			toast.success(printer ? "تم تحديث الطابعة" : "تمت إضافة الطابعة");
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] max-w-3xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: printer ? "تعديل بيانات الطابعة" : "إضافة طابعة جديدة" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "رقم الأصل (يُنشأ تلقائيًا إن ترك فارغًا)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								dir: "ltr",
								placeholder: "PRN-0001",
								value: form.asset_id,
								onChange: (e) => set("asset_id", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "اسم الطابعة *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.name,
								onChange: (e) => set("name", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الشركة المصنّعة",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.manufacturer,
								onChange: (e) => set("manufacturer", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الموديل",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.model,
								onChange: (e) => set("model", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نوع الطابعة",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "ليزر ملونة / نافثة للحبر…",
								value: form.printer_type,
								onChange: (e) => set("printer_type", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الرقم التسلسلي",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								dir: "ltr",
								value: form.serial_number,
								onChange: (e) => set("serial_number", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "عنوان IP",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								dir: "ltr",
								value: form.ip_address,
								onChange: (e) => set("ip_address", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "عنوان MAC",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								dir: "ltr",
								value: form.mac_address,
								onChange: (e) => set("mac_address", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الفرع",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
								value: form.branch_id,
								onChange: (v) => set("branch_id", v),
								options: lookups?.branches ?? []
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "القسم",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
								value: form.department_id,
								onChange: (v) => set("department_id", v),
								options: lookups?.departments ?? []
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الشخص المسؤول",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Picker, {
								value: form.responsible_person_id,
								onChange: (v) => set("responsible_person_id", v),
								options: lookups?.persons ?? []
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "الحالة",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.status,
								onValueChange: (v) => set("status", v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(PRINTER_STATUS).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: k,
									children: v
								}, k)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "تاريخ الشراء",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
								value: form.purchase_date,
								onChange: (value) => set("purchase_date", value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "تاريخ انتهاء الضمان",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateInput, {
								value: form.warranty_expiry,
								onChange: (value) => set("warranty_expiry", value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "صورة الطابعة",
							className: "sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "file",
								accept: "image/*",
								onChange: (e) => setFile(e.target.files?.[0] ?? null)
							}), previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: previewUrl,
								alt: "معاينة الصورة الجديدة",
								className: "mt-2 h-40 w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterImage, {
								path: printer?.image_url,
								alt: printer?.name ?? "صورة الطابعة",
								className: "mt-2 h-40 w-full"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "ملاحظات",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: form.notes,
								onChange: (e) => set("notes", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "إلغاء"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save.mutate(),
					disabled: save.isPending,
					children: "حفظ"
				})] })
			]
		})
	});
}
function Field({ label, children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-2 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function Picker({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "اختر…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: NONE,
			children: "غير محدد"
		}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o.id,
			children: o.name
		}, o.id))] })]
	});
}
//#endregion
export { useLookups as n, PrinterFormDialog as t };
