//#region node_modules/.nitro/vite/services/ssr/assets/pms-ALghGJ54.js
var PRINTER_STATUS = {
	active: "نشطة",
	maintenance: "تحت الصيانة",
	out_of_service: "خارج الخدمة",
	retired: "مؤرشفة"
};
var STATUS_CLASS = {
	active: "bg-success/15 text-success border-success/30",
	maintenance: "bg-warning/20 text-warning-foreground border-warning/40",
	out_of_service: "bg-destructive/15 text-destructive border-destructive/30",
	retired: "bg-muted text-muted-foreground border-border"
};
var TONER_COLORS = {
	black: "أسود",
	cyan: "سماوي",
	magenta: "أرجواني",
	yellow: "أصفر",
	other: "أخرى"
};
var MAINTENANCE_TYPES = {
	repair: "إصلاح",
	part_replacement: "استبدال قطعة",
	cleaning: "تنظيف",
	preventive: "صيانة وقائية",
	setup: "إعداد / تهيئة",
	other: "أخرى"
};
function formatDate(value) {
	if (!value) return "—";
	const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (datePart) return `${datePart[3]}/${datePart[2]}/${datePart[1]}`;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}
function today() {
	const date = /* @__PURE__ */ new Date();
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function daysUntil(date) {
	if (!date) return null;
	const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
	const target = datePart ? new Date(Number(datePart[1]), Number(datePart[2]) - 1, Number(datePart[3])) : new Date(date);
	if (Number.isNaN(target.getTime())) return null;
	const diff = target.getTime() - (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
	return Math.round(diff / 864e5);
}
async function resolveImage(path) {
	return path ?? null;
}
async function uploadPrinterImage(file) {
	const formData = new FormData();
	formData.append("image", file);
	const response = await fetch("/api/printer-images", {
		method: "POST",
		body: formData
	});
	const body = await response.json();
	if (!response.ok) throw new Error(body.message ?? "تعذر رفع الصورة");
	return body.path;
}
async function deletePrinterImage(path) {
	if (!path?.startsWith("/uploads/printers/")) return;
	if (!(await fetch(`/api/printer-images?path=${encodeURIComponent(path)}`, { method: "DELETE" })).ok) throw new Error("تعذر حذف الصورة القديمة");
}
//#endregion
export { daysUntil as a, resolveImage as c, TONER_COLORS as i, today as l, PRINTER_STATUS as n, deletePrinterImage as o, STATUS_CLASS as r, formatDate as s, MAINTENANCE_TYPES as t, uploadPrinterImage as u };
