import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductLite } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface CategorySearch { q: string; cat: string; }

export const Route = createFileRoute("/category")({
  validateSearch: (s: Record<string, unknown>): CategorySearch => ({
    q: typeof s.q === "string" ? s.q : "",
    cat: typeof s.cat === "string" ? s.cat : "",
  }),
  head: () => ({ meta: [{ title: "Shop — NOVA.shop" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<(ProductLite & { category_id: string | null })[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    supabase.from("categories").select("id,name").then(({ data }) => setCats(data ?? []));
    supabase.from("products").select("id,name,price,image_url,stock,category_id").then(({ data }) => {
      setProducts((data ?? []) as any);
    });
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p =>
      (!search.q || p.name.toLowerCase().includes(search.q.toLowerCase())) &&
      (!search.cat || p.category_id === search.cat) &&
      Number(p.price) <= maxPrice
    );
  }, [products, search, maxPrice]);

  const update = (patch: Partial<CategorySearch>) =>
    navigate({ search: (prev: CategorySearch) => ({ ...prev, ...patch }) });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Browse the collection</h1>
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="glass rounded-2xl p-5 h-fit space-y-6 sticky top-20">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input value={search.q} onChange={(e) => update({ q: e.target.value })} placeholder="Product name…" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={search.cat || "all"} onValueChange={(v) => update({ cat: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max price: ${maxPrice}</label>
            <Slider value={[maxPrice]} max={2000} step={10} onValueChange={(v) => setMaxPrice(v[0])} />
          </div>
        </aside>
        <div>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} products</p>
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground">No products match your filters.</div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
