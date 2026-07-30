import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/DateInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLookups } from "@/components/PrinterFormDialog";
import {
  PRINTER_STATUS,
  TONER_COLORS,
  MAINTENANCE_TYPES,
  formatDate,
  type PrinterStatus,
  type TonerColor,
  type MaintenanceType,
} from "@/lib/pms";
import { Printer as PrinterIcon } from "lucide-react";

const ALL = "__all__";
type ReportKind = "printers" | "toners" | "maintenance" | "toner-usage";

const REPORTS: { value: ReportKind; label: string }[] = [
  { value: "printers", label: "تقرير الطابعات" },
  { value: "toners", label: "تقرير مخزون الأحبار" },
  { value: "maintenance", label: "تقرير الصيانة" },
  { value: "toner-usage", label: "تقرير استهلاك الأحبار" },
];

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "التقارير — نظام إدارة الطابعات" },
      { name: "description", content: "تقارير الطابعات والأحبار والصيانة والاستهلاك مع إمكانية الطباعة و PDF." },
      { property: "og:title", content: "التقارير — نظام إدارة الطابعات" },
      { property: "og:description", content: "استخرج تقارير جاهزة للطباعة أو الحفظ كملف PDF." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: lookups } = useLookups();
  const [kind, setKind] = useState<ReportKind>("printers");
  const [branch, setBranch] = useState(ALL);
  const [dept, setDept] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data } = useQuery({
    queryKey: ["report-data"],
    queryFn: async () => {
      const [printers, toners, maintenance, replacements] = await Promise.all([
        supabase.from("printers").select("*").order("asset_id"),
        supabase.from("toners").select("*").order("name"),
        supabase.from("maintenance_records").select("*").order("service_date", { ascending: false }),
        supabase
          .from("toner_replacements")
          .select("*, toner_replacement_items(*)")
          .order("change_date", { ascending: false }),
      ]);
      return {
        printers: printers.data ?? [],
        toners: toners.data ?? [],
        maintenance: maintenance.data ?? [],
        replacements: replacements.data ?? [],
      };
    },
  });

  const nameOf = (list: { id: string; name: string }[] | undefined, id: string | null) =>
    list?.find((x) => x.id === id)?.name ?? "—";

  const printers = (data?.printers ?? []).filter(
    (p) => (branch === ALL || p.branch_id === branch) && (dept === ALL || p.department_id === dept),
  );
  const printerIds = new Set(printers.map((p) => p.id));
  const inRange = (d: string) => (!from || d >= from) && (!to || d <= to);

  const maintenance = (data?.maintenance ?? []).filter(
    (m) => printerIds.has(m.printer_id) && inRange(m.service_date),
  );
  const replacements = (data?.replacements ?? []).filter(
    (r) => printerIds.has(r.printer_id) && inRange(r.change_date),
  );

  const usage = new Map<string, number>();
  for (const r of replacements)
    for (const i of r.toner_replacement_items ?? [])
      usage.set(i.toner_name, (usage.get(i.toner_name) ?? 0) + i.quantity);

  const title = REPORTS.find((r) => r.value === kind)!.label;

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-sm text-muted-foreground">اختر نوع التقرير ثم اطبعه أو احفظه كملف PDF</p>
        </div>
        <Button className="gap-2" onClick={() => window.print()}>
          <PrinterIcon className="size-4" />
          طباعة / حفظ PDF
        </Button>
      </header>

      <div className="no-print surface-panel grid gap-4 p-4 md:grid-cols-5">
        <div className="space-y-2">
          <Label>نوع التقرير</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as ReportKind)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORTS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>الفرع</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل الفروع</SelectItem>
              {(lookups?.branches ?? []).map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>القسم</Label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل الأقسام</SelectItem>
              {(lookups?.departments ?? []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>من تاريخ</Label>
          <DateInput value={from} onChange={setFrom} />
        </div>
        <div className="space-y-2">
          <Label>إلى تاريخ</Label>
          <DateInput value={to} onChange={setTo} />
        </div>
      </div>

      <section className="surface-panel space-y-4 p-6 print:border-0 print:shadow-none">
        <div className="flex items-baseline justify-between border-b pb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-muted-foreground">{formatDate(new Date().toISOString())}</span>
        </div>

        {kind === "printers" && (
          <ReportTable
            head={["رقم الأصل", "الاسم", "الموديل", "الفرع", "القسم", "المسؤول", "الحالة"]}
            rows={printers.map((p) => [
              p.asset_id,
              p.name,
              p.model || "—",
              nameOf(lookups?.branches, p.branch_id),
              nameOf(lookups?.departments, p.department_id),
              nameOf(lookups?.persons, p.responsible_person_id),
              PRINTER_STATUS[p.status as PrinterStatus],
            ])}
          />
        )}

        {kind === "toners" && (
          <ReportTable
            head={["الحبر", "الكود", "اللون", "الكمية", "الحد الأدنى", "الحالة"]}
            rows={(data?.toners ?? []).map((t) => [
              t.name,
              t.code || "—",
              TONER_COLORS[t.color as TonerColor],
              String(t.quantity),
              String(t.min_quantity),
              t.quantity <= t.min_quantity ? "نقص" : "متوفر",
            ])}
          />
        )}

        {kind === "maintenance" && (
          <ReportTable
            head={["التاريخ", "الطابعة", "النوع", "الوصف", "القطع", "الفني"]}
            rows={maintenance.map((m) => [
              formatDate(m.service_date),
              printers.find((p) => p.id === m.printer_id)?.name ?? "—",
              MAINTENANCE_TYPES[m.maintenance_type as MaintenanceType],
              m.description || "—",
              (m.replaced_parts ?? []).join("، ") || "—",
              m.technician || "—",
            ])}
          />
        )}

        {kind === "toner-usage" && (
          <ReportTable
            head={["الحبر", "إجمالي الاستهلاك"]}
            rows={[...usage.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, qty]) => [name, String(qty)])}
          />
        )}

      </section>
    </div>
  );
}

function ReportTable({ head, rows }: { head: string[]; rows: string[][] }) {
  if (rows.length === 0)
    return <p className="py-8 text-center text-muted-foreground">لا توجد بيانات ضمن هذا التصفية.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h) => (
            <TableHead key={h} className="text-right">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {r.map((c, j) => (
              <TableCell key={j}>{c}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
