import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/DateInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deletePrinterImage, PRINTER_STATUS, uploadPrinterImage } from "@/lib/pms";
import { PrinterImage } from "@/components/PrinterImage";
import type { TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

const NONE = "__none__";

export type PrinterRow = {
  id: string;
  asset_id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  printer_type: string | null;
  serial_number: string | null;
  ip_address: string | null;
  mac_address: string | null;
  branch_id: string | null;
  department_id: string | null;
  responsible_person_id: string | null;
  status: string;
  purchase_date: string | null;
  warranty_expiry: string | null;
  notes: string | null;
  image_url: string | null;
  is_favorite: boolean;
};

const EMPTY = {
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
  notes: "",
};

export function useLookups() {
  return useQuery({
    queryKey: ["lookups"],
    queryFn: async () => {
      const [branches, departments, persons, parts, suppliers] = await Promise.all([
        supabase.from("branches").select("*").order("name"),
        supabase.from("departments").select("*").order("name"),
        supabase.from("responsible_persons").select("*").order("name"),
        supabase.from("parts").select("*").order("name"),
        supabase.from("suppliers").select("*").order("name"),
      ]);
      return {
        branches: branches.data ?? [],
        departments: departments.data ?? [],
        persons: persons.data ?? [],
        parts: parts.data ?? [],
        suppliers: suppliers.data ?? [],
      };
    },
  });
}

export function PrinterFormDialog({
  open,
  onOpenChange,
  printer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  printer?: PrinterRow | null;
}) {
  const qc = useQueryClient();
  const { data: lookups } = useLookups();
  const [form, setForm] = useState({ ...EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (printer) {
      setForm({
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
        notes: printer.notes ?? "",
      });
    } else {
      setForm({ ...EMPTY });
    }
    setFile(null);
  }, [open, printer]);

  useEffect(() => {
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

      const payload: TablesInsert<"printers"> = {
        name: form.name.trim(),
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        printer_type: form.printer_type || null,
        serial_number: form.serial_number || null,
        ip_address: form.ip_address || null,
        mac_address: form.mac_address || null,
        branch_id: form.branch_id === NONE ? null : form.branch_id,
        department_id: form.department_id === NONE ? null : form.department_id,
        responsible_person_id:
          form.responsible_person_id === NONE ? null : form.responsible_person_id,
        status: form.status as TablesInsert<"printers">["status"],
        purchase_date: form.purchase_date || null,
        warranty_expiry: form.warranty_expiry || null,
        notes: form.notes || null,
        image_url: imagePath,
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
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{printer ? "تعديل بيانات الطابعة" : "إضافة طابعة جديدة"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رقم الأصل (يُنشأ تلقائيًا إن ترك فارغًا)">
            <Input
              dir="ltr"
              placeholder="PRN-0001"
              value={form.asset_id}
              onChange={(e) => set("asset_id", e.target.value)}
            />
          </Field>
          <Field label="اسم الطابعة *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="الشركة المصنّعة">
            <Input value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
          </Field>
          <Field label="الموديل">
            <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
          </Field>
          <Field label="نوع الطابعة">
            <Input
              placeholder="ليزر ملونة / نافثة للحبر…"
              value={form.printer_type}
              onChange={(e) => set("printer_type", e.target.value)}
            />
          </Field>
          <Field label="الرقم التسلسلي">
            <Input dir="ltr" value={form.serial_number} onChange={(e) => set("serial_number", e.target.value)} />
          </Field>
          <Field label="عنوان IP">
            <Input dir="ltr" value={form.ip_address} onChange={(e) => set("ip_address", e.target.value)} />
          </Field>
          <Field label="عنوان MAC">
            <Input dir="ltr" value={form.mac_address} onChange={(e) => set("mac_address", e.target.value)} />
          </Field>

          <Field label="الفرع">
            <Picker
              value={form.branch_id}
              onChange={(v) => set("branch_id", v)}
              options={lookups?.branches ?? []}
            />
          </Field>
          <Field label="القسم">
            <Picker
              value={form.department_id}
              onChange={(v) => set("department_id", v)}
              options={lookups?.departments ?? []}
            />
          </Field>
          <Field label="الشخص المسؤول">
            <Picker
              value={form.responsible_person_id}
              onChange={(v) => set("responsible_person_id", v)}
              options={lookups?.persons ?? []}
            />
          </Field>
          <Field label="الحالة">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRINTER_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="تاريخ الشراء">
            <DateInput value={form.purchase_date} onChange={(value) => set("purchase_date", value)} />
          </Field>
          <Field label="تاريخ انتهاء الضمان">
            <DateInput
              value={form.warranty_expiry}
              onChange={(value) => set("warranty_expiry", value)}
            />
          </Field>

          <Field label="صورة الطابعة" className="sm:col-span-2">
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {previewUrl ? (
              <img src={previewUrl} alt="معاينة الصورة الجديدة" className="mt-2 h-40 w-full object-cover" />
            ) : (
              <PrinterImage path={printer?.image_url} alt={printer?.name ?? "صورة الطابعة"} className="mt-2 h-40 w-full" />
            )}
          </Field>

          <Field label="ملاحظات" className="sm:col-span-2">
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="اختر…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>غير محدد</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
