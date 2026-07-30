export const PRINTER_STATUS = {
  active: "نشطة",
  maintenance: "تحت الصيانة",
  out_of_service: "خارج الخدمة",
  retired: "مؤرشفة",
} as const;
export type PrinterStatus = keyof typeof PRINTER_STATUS;

export const STATUS_CLASS: Record<PrinterStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  maintenance: "bg-warning/20 text-warning-foreground border-warning/40",
  out_of_service: "bg-destructive/15 text-destructive border-destructive/30",
  retired: "bg-muted text-muted-foreground border-border",
};

export const TONER_COLORS = {
  black: "أسود",
  cyan: "سماوي",
  magenta: "أرجواني",
  yellow: "أصفر",
  other: "أخرى",
} as const;
export type TonerColor = keyof typeof TONER_COLORS;

export const TONER_SWATCH: Record<TonerColor, string> = {
  black: "bg-toner-black",
  cyan: "bg-toner-cyan",
  magenta: "bg-toner-magenta",
  yellow: "bg-toner-yellow",
  other: "bg-toner-other",
};

export const MAINTENANCE_TYPES = {
  repair: "إصلاح",
  part_replacement: "استبدال قطعة",
  cleaning: "تنظيف",
  preventive: "صيانة وقائية",
  setup: "إعداد / تهيئة",
  other: "أخرى",
} as const;
export type MaintenanceType = keyof typeof MAINTENANCE_TYPES;

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (datePart) return `${datePart[3]}/${datePart[2]}/${datePart[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysUntil(date?: string | null) {
  if (!date) return null;
  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  const target = datePart
    ? new Date(Number(datePart[1]), Number(datePart[2]) - 1, Number(datePart[3]))
    : new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / 86400000);
}

export async function resolveImage(path?: string | null) {
  return path ?? null;
}

export async function uploadPrinterImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/printer-images", { method: "POST", body: formData });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "تعذر رفع الصورة");
  return body.path as string;
}

export async function deletePrinterImage(path?: string | null) {
  if (!path?.startsWith("/uploads/printers/")) return;
  const response = await fetch(`/api/printer-images?path=${encodeURIComponent(path)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("تعذر حذف الصورة القديمة");
}

export function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
