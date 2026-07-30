import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/DateInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { formatDate, today } from "@/lib/pms";
import { toast } from "sonner";

const CUSTOM = "__custom__";

type ItemDraft = { tonerId: string; customName: string; quantity: number };

export function TonerHistoryTab({ printerId }: { printerId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([{ tonerId: CUSTOM, customName: "", quantity: 1 }]);

  const { data: toners } = useQuery({
    queryKey: ["toners"],
    queryFn: async () => (await supabase.from("toners").select("*").order("name")).data ?? [],
  });

  const { data: history } = useQuery({
    queryKey: ["toner-history", printerId],
    queryFn: async () =>
      (
        await supabase
          .from("toner_replacements")
          .select("*, toner_replacement_items(*)")
          .eq("printer_id", printerId)
          .order("change_date", { ascending: false })
      ).data ?? [],
  });

  function reset() {
    setEditId(null);
    setDate(today());
    setNotes("");
    setItems([{ tonerId: CUSTOM, customName: "", quantity: 1 }]);
  }

  const save = useMutation({
    mutationFn: async () => {
      const clean = items.filter((i) => (i.tonerId !== CUSTOM ? true : i.customName.trim()));
      if (clean.length === 0) throw new Error("أضف حبرًا واحدًا على الأقل");

      let replacementId = editId;
      if (editId) {
        const { error } = await supabase
          .from("toner_replacements")
          .update({ change_date: date, notes: notes || null })
          .eq("id", editId);
        if (error) throw error;
        await supabase.from("toner_replacement_items").delete().eq("replacement_id", editId);
      } else {
        const { data, error } = await supabase
          .from("toner_replacements")
          .insert({ printer_id: printerId, change_date: date, notes: notes || null })
          .select("id")
          .single();
        if (error) throw error;
        replacementId = data.id;
      }

      const rows = clean.map((i) => {
        const toner = toners?.find((t) => t.id === i.tonerId);
        return {
          replacement_id: replacementId!,
          toner_id: toner ? toner.id : null,
          toner_name: toner ? toner.name : i.customName.trim(),
          quantity: Math.max(1, i.quantity),
        };
      });
      const { error: itemsError } = await supabase.from("toner_replacement_items").insert(rows);
      if (itemsError) throw itemsError;

      // Deduct from inventory for known toners (only on creation)
      if (!editId) {
        for (const r of rows) {
          if (!r.toner_id) continue;
          const toner = toners?.find((t) => t.id === r.toner_id);
          if (!toner) continue;
          await supabase
            .from("toners")
            .update({ quantity: Math.max(0, toner.quantity - r.quantity) })
            .eq("id", toner.id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حفظ عملية تغيير الحبر");
      setOpen(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("toner_replacements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حذف السجل");
    },
  });

  function startEdit(record: NonNullable<typeof history>[number]) {
    setEditId(record.id);
    setDate(record.change_date);
    setNotes(record.notes ?? "");
    setItems(
      (record.toner_replacement_items ?? []).map((i) => ({
        tonerId: i.toner_id ?? CUSTOM,
        customName: i.toner_id ? "" : i.toner_name,
        quantity: i.quantity,
      })),
    );
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          تسجيل تغيير حبر
        </Button>
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الأحبار</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(history ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  لا توجد سجلات تغيير حبر.
                </TableCell>
              </TableRow>
            )}
            {(history ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDate(r.change_date)}</TableCell>
                <TableCell>
                  {(r.toner_replacement_items ?? []).map((i) => i.toner_name).join("، ") || "—"}
                </TableCell>
                <TableCell>
                  {(r.toner_replacement_items ?? []).reduce((a, i) => a + i.quantity, 0)}
                </TableCell>
                <TableCell className="text-muted-foreground">{r.notes || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(r)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل عملية تغيير حبر" : "تسجيل عملية تغيير حبر"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <DateInput value={date} onChange={setDate} />
            </div>

            <div className="space-y-3">
              <Label>الأحبار المستخدمة</Label>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={item.tonerId}
                      onValueChange={(v) =>
                        setItems((arr) => arr.map((x, i) => (i === idx ? { ...x, tonerId: v } : x)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحبر" />
                      </SelectTrigger>
                      <SelectContent>
                        {(toners ?? []).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} (متوفر: {t.quantity})
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM}>حبر غير موجود بالمخزون…</SelectItem>
                      </SelectContent>
                    </Select>
                    {item.tonerId === CUSTOM && (
                      <Input
                        className="mt-2"
                        placeholder="اسم الحبر"
                        value={item.customName}
                        onChange={(e) =>
                          setItems((arr) =>
                            arr.map((x, i) => (i === idx ? { ...x, customName: e.target.value } : x)),
                          )
                        }
                      />
                    )}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((arr) =>
                        arr.map((x, i) => (i === idx ? { ...x, quantity: Number(e.target.value) } : x)),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  setItems((arr) => [...arr, { tonerId: CUSTOM, customName: "", quantity: 1 }])
                }
              >
                <Plus className="size-4" />
                إضافة حبر آخر
              </Button>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
    </div>
  );
}
