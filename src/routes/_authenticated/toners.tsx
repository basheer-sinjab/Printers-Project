import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/DateInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, PackagePlus, Search } from "lucide-react";
import { TONER_COLORS, formatDate, today, type TonerColor } from "@/lib/pms";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/toners")({
  head: () => ({
    meta: [
      { title: "مخزون الأحبار — نظام إدارة الطابعات" },
      { name: "description", content: "إدارة أنواع الأحبار والكميات المتوفرة وحد التنبيه وإدخالات المخزون." },
      { property: "og:title", content: "مخزون الأحبار — نظام إدارة الطابعات" },
      { property: "og:description", content: "تتبع كميات الأحبار وتنبيهات النقص وسجل الإدخالات." },
    ],
  }),
  component: TonersPage,
});

const emptyToner = {
  name: "",
  code: "",
  color: "black" as TonerColor,
  quantity: 0,
  min_quantity: 2,
  supplier_id: "",
  notes: "",
};

function TonersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyToner);
  const [stockFor, setStockFor] = useState<{ id: string; name: string; quantity: number } | null>(null);
  const [stockQty, setStockQty] = useState(1);
  const [stockDate, setStockDate] = useState(today());
  const [stockNotes, setStockNotes] = useState("");

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => (await supabase.from("suppliers").select("*").order("name")).data ?? [],
  });

  const { data: toners } = useQuery({
    queryKey: ["toners"],
    queryFn: async () => (await supabase.from("toners").select("*").order("name")).data ?? [],
  });

  const { data: entries } = useQuery({
    queryKey: ["toner-entries"],
    queryFn: async () =>
      (
        await supabase
          .from("toner_stock_entries")
          .select("*")
          .order("entry_date", { ascending: false })
          .limit(30)
      ).data ?? [],
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
        notes: form.notes || null,
      };
      const { error } = editId
        ? await supabase.from("toners").update(payload).eq("id", editId)
        : await supabase.from("toners").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حفظ الحبر");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("toners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم الحذف");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addStock = useMutation({
    mutationFn: async () => {
      if (!stockFor) return;
      const qty = Math.max(1, Number(stockQty));
      const { error } = await supabase.from("toner_stock_entries").insert({
        toner_id: stockFor.id,
        quantity: qty,
        entry_date: stockDate,
        notes: stockNotes || null,
      });
      if (error) throw error;
      const { error: upErr } = await supabase
        .from("toners")
        .update({ quantity: stockFor.quantity + qty })
        .eq("id", stockFor.id);
      if (upErr) throw upErr;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تمت إضافة الكمية للمخزون");
      setStockFor(null);
      setStockQty(1);
      setStockNotes("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (toners ?? []).filter((t) =>
    [t.name, t.code].filter(Boolean).some((v) => String(v).toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مخزون الأحبار</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} نوع حبر · {filtered.filter((t) => t.quantity <= t.min_quantity).length} تحت الحد الأدنى
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditId(null);
            setForm(emptyToner);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          إضافة حبر
        </Button>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pr-9"
          placeholder="بحث بالاسم أو الكود…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الكود</TableHead>
              <TableHead className="text-right">اللون</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">الحد الأدنى</TableHead>
              <TableHead className="text-right">المورد</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  لا توجد أحبار مسجلة.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((t) => {
              const low = t.quantity <= t.min_quantity;
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {t.code || "—"}
                  </TableCell>
                  <TableCell>{TONER_COLORS[t.color as TonerColor]}</TableCell>
                  <TableCell>
                    <Badge variant={low ? "destructive" : "secondary"}>{t.quantity}</Badge>
                  </TableCell>
                  <TableCell>{t.min_quantity}</TableCell>
                  <TableCell>
                    {suppliers?.find((s) => s.id === t.supplier_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="إضافة كمية"
                        onClick={() => {
                          setStockFor({ id: t.id, name: t.name, quantity: t.quantity });
                          setStockDate(today());
                        }}
                      >
                        <PackagePlus className="size-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditId(t.id);
                          setForm({
                            name: t.name,
                            code: t.code ?? "",
                            color: t.color as TonerColor,
                            quantity: t.quantity,
                            min_quantity: t.min_quantity,
                            supplier_id: t.supplier_id ?? "",
                            notes: t.notes ?? "",
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">آخر إدخالات المخزون</h2>
        <div className="surface-panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحبر</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entries ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    لا توجد إدخالات.
                  </TableCell>
                </TableRow>
              )}
              {(entries ?? []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{formatDate(e.entry_date)}</TableCell>
                  <TableCell>{toners?.find((t) => t.id === e.toner_id)?.name ?? "—"}</TableCell>
                  <TableCell>+{e.quantity}</TableCell>
                  <TableCell className="text-muted-foreground">{e.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل حبر" : "إضافة حبر"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>الاسم</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الكود</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>اللون</Label>
              <Select
                value={form.color}
                onValueChange={(v) => setForm({ ...form, color: v as TonerColor })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TONER_COLORS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الكمية</Label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>حد التنبيه</Label>
              <Input
                type="number"
                min={0}
                value={form.min_quantity}
                onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>المورد</Label>
              <Select
                value={form.supplier_id}
                onValueChange={(v) => setForm({ ...form, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {(suppliers ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>ملاحظات</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!stockFor} onOpenChange={(o) => !o && setStockFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة كمية — {stockFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <DateInput value={stockDate} onChange={setStockDate} />
            </div>
            <div className="space-y-2">
              <Label>الكمية المضافة</Label>
              <Input
                type="number"
                min={1}
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea rows={2} value={stockNotes} onChange={(e) => setStockNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockFor(null)}>
              إلغاء
            </Button>
            <Button onClick={() => addStock.mutate()} disabled={addStock.isPending}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
