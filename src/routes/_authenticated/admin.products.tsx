import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Category { id: string; name: string; }
interface Product { id: string; name: string; description: string; price: number; image_url: string; stock: number; category_id: string | null; }

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [newCat, setNewCat] = useState("");

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts((p.data ?? []) as Product[]);
    setCats((c.data ?? []) as Category[]);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing({ id: "", name: "", description: "", price: 0, image_url: "", stock: 0, category_id: cats[0]?.id ?? null });
    setOpen(true);
  };
  const startEdit = (p: Product) => { setEditing(p); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Name required"); return; }
    const payload = { name: editing.name, description: editing.description, price: editing.price, image_url: editing.image_url, stock: editing.stock, category_id: editing.category_id };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newCat.trim() });
    if (error) toast.error(error.message);
    else { setNewCat(""); load(); toast.success("Category added"); }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label>New category</Label>
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Gaming" />
        </div>
        <Button onClick={addCategory} variant="outline">Add category</Button>
        <div className="ml-auto"><Button className="btn-glow" onClick={startNew}><Plus className="h-4 w-4 mr-1" /> New product</Button></div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {products.map(p => (
                <motion.tr key={p.id} layout exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-secondary/40">
                  <td className="p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                      {p.image_url && <img src={p.image_url} className="h-full w-full object-cover" />}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{cats.find(c => c.id === p.category_id)?.name ?? "—"}</td>
                  <td className="p-3">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Image URL</Label><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://…" /></div>
              <div>
                <Label>Category</Label>
                <Select value={editing.category_id ?? ""} onValueChange={(v) => setEditing({ ...editing, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="btn-glow" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
