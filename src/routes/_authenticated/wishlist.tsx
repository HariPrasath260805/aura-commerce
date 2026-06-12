import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductLite } from "@/components/ProductCard";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — NOVA.shop" }] }),
  component: WishlistPage,
});

interface Item { id: string; product: ProductLite; }

function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("wishlist").select("id, product:products(id,name,price,image_url,stock)").eq("user_id", user.id);
    setItems((data ?? []) as any);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    load();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Heart className="text-[var(--neon-pink)]" /> Wishlist</h1>
      <p className="text-muted-foreground mb-8">Your saved favorites.</p>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div key={it.id} layout exit={{ opacity: 0, scale: 0.9 }} className="relative">
                <ProductCard product={it.product} onChange={load} />
                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-8 w-8 rounded-full" onClick={() => remove(it.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
