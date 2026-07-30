import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrinterImage } from "@/components/PrinterImage";
import { PrinterFormDialog, useLookups } from "@/components/PrinterFormDialog";
import { PRINTER_STATUS, STATUS_CLASS, formatDate, type PrinterStatus } from "@/lib/pms";
import { Plus, Search, Star } from "lucide-react";

const ALL = "__all__";

export const Route = createFileRoute("/_authenticated/printers/")({
  head: () => ({
    meta: [
      { title: "الطابعات — نظام إدارة الطابعات" },
      { name: "description", content: "استعرض وابحث وأدر جميع طابعات الشركة مع حالتها وأقسامها." },
      { property: "og:title", content: "الطابعات — نظام إدارة الطابعات" },
      { property: "og:description", content: "قائمة الطابعات مع البحث والتصفية." },
    ],
  }),
  component: PrintersPage,
});

function PrintersPage() {
  const { data: lookups } = useLookups();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState(ALL);
  const [dept, setDept] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [manufacturer, setManufacturer] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["printers-list"],
    queryFn: async () => {
      const [printers, changes] = await Promise.all([
        supabase.from("printers").select("*").order("asset_id"),
        supabase.from("toner_replacements").select("printer_id, change_date"),
      ]);
      const last = new Map<string, string>();
      for (const c of changes.data ?? []) {
        const prev = last.get(c.printer_id);
        if (!prev || c.change_date > prev) last.set(c.printer_id, c.change_date);
      }
      return { printers: printers.data ?? [], last };
    },
  });

  const manufacturers = useMemo(
    () => [...new Set((data?.printers ?? []).map((p) => p.manufacturer).filter(Boolean))] as string[],
    [data],
  );

  const filtered = (data?.printers ?? []).filter((p) => {
    const term = q.trim().toLowerCase();
    const matches =
      !term ||
      [p.name, p.asset_id, p.serial_number, p.ip_address, p.model]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    return (
      matches &&
      (branch === ALL || p.branch_id === branch) &&
      (dept === ALL || p.department_id === dept) &&
      (status === ALL || p.status === status) &&
      (manufacturer === ALL || p.manufacturer === manufacturer)
    );
  });

  const nameOf = (list: { id: string; name: string }[] | undefined, id: string | null) =>
    list?.find((x) => x.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الطابعات</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} طابعة معروضة</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          إضافة طابعة
        </Button>
      </header>

      <div className="surface-panel grid gap-3 p-4 md:grid-cols-5">
        <div className="relative md:col-span-1">
          <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pr-9"
            placeholder="بحث بالاسم أو الرقم أو IP…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Filter value={branch} onChange={setBranch} placeholder="كل الفروع" options={lookups?.branches} />
        <Filter value={dept} onChange={setDept} placeholder="كل الأقسام" options={lookups?.departments} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>كل الحالات</SelectItem>
            {Object.entries(PRINTER_STATUS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={manufacturer} onValueChange={setManufacturer}>
          <SelectTrigger>
            <SelectValue placeholder="كل الشركات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>كل الشركات المصنّعة</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">جارٍ التحميل…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state p-12 text-center text-muted-foreground">
          لا توجد طابعات مطابقة.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/printers/$id"
              params={{ id: p.id }}
              className="surface-panel interactive-card group overflow-hidden hover:interactive-card-hover"
            >
              <div className="relative">
                <PrinterImage path={p.image_url} alt={p.name} className="h-48 w-full" />
                {p.is_favorite && (
                  <Star className="absolute top-3 left-3 size-5 fill-warning text-warning" />
                )}
                <Badge
                  variant="outline"
                  className={`absolute top-3 right-3 bg-card ${STATUS_CLASS[p.status as PrinterStatus]}`}
                >
                  {PRINTER_STATUS[p.status as PrinterStatus]}
                </Badge>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {p.asset_id}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{p.model || "بدون موديل"}</p>
                <dl className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>القسم: {nameOf(lookups?.departments, p.department_id)}</div>
                  <div>المسؤول: {nameOf(lookups?.persons, p.responsible_person_id)}</div>
                </dl>
                <p className="border-t pt-2 text-xs text-muted-foreground">
                  آخر تغيير حبر: {formatDate(data?.last.get(p.id))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PrinterFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function Filter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options?: { id: string; name: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {(options ?? []).map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
