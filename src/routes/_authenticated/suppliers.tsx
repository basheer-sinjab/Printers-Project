import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "الموردون — PrintersFloss" },
      { name: "description", content: "سجل موردي الأحبار وقطع الغيار مع بيانات التواصل." },
      { property: "og:title", content: "الموردون — PrintersFloss" },
      { property: "og:description", content: "إدارة بيانات الموردين وربطهم بالأحبار." },
    ],
  }),
  component: SuppliersPage,
});

const empty = { name: "", contact_person: "", phone: "", email: "", notes: "" };

function SuppliersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => (await supabase.from("suppliers").select("*").order("name")).data ?? [],
  });

  const { data: toners } = useQuery({
    queryKey: ["toners"],
    queryFn: async () => (await supabase.from("toners").select("*")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("اسم المورد مطلوب");
      const payload = {
        name: form.name.trim(),
        contact_person: form.contact_person || null,
        phone: form.phone || null,
        email: form.email || null,
        notes: form.notes || null,
      };
      const { error } = editId
        ? await supabase.from("suppliers").update(payload).eq("id", editId)
        : await supabase.from("suppliers").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حفظ المورد");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم الحذف");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الموردون</h1>
          <p className="text-sm text-muted-foreground">{(suppliers ?? []).length} مورد مسجل</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          إضافة مورد
        </Button>
      </header>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">مسؤول التواصل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الأحبار المرتبطة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(suppliers ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  لا يوجد موردون.
                </TableCell>
              </TableRow>
            )}
            {(suppliers ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_person || "—"}</TableCell>
                <TableCell dir="ltr" className="text-right font-mono text-sm">
                  {s.phone || "—"}
                </TableCell>
                <TableCell dir="ltr" className="text-right text-sm">
                  {s.email || "—"}
                </TableCell>
                <TableCell>{(toners ?? []).filter((t) => t.supplier_id === s.id).length}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditId(s.id);
                        setForm({
                          name: s.name,
                          contact_person: s.contact_person ?? "",
                          phone: s.phone ?? "",
                          email: s.email ?? "",
                          notes: s.notes ?? "",
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل مورد" : "إضافة مورد"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>اسم المورد</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>مسؤول التواصل</Label>
              <Input
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                dir="ltr"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
    </div>
  );
}
