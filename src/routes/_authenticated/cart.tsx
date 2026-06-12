import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; image_url: string; stock: number };
}

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — NOVA.shop" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("cart")
      .select("id, quantity, product:products(id,name,price,image_url,stock)")
      .eq("user_id", user.id);
    setItems((data ?? []) as any);
  };

  useEffect(() => { load(); }, [user]);

  const updateQty = async (id: string, q: number) => {
    if (q <= 0) { await supabase.from("cart").delete().eq("id", id); }
    else { await supabase.from("cart").update({ quantity: q }).eq("id", id); }
    load();
  };

  const total = items.reduce((s, it) => s + Number(it.product.price) * it.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><ShoppingBag /> Your cart</h1>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/category" search={{ q: "", cat: "" }}><Button className="btn-glow">Start shopping</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((it) => (
                <motion.div key={it.id} layout exit={{ opacity: 0, x: -20 }} className="glass rounded-2xl p-4 flex gap-4 items-center">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {it.product.image_url && <img src={it.product.image_url} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.product.name}</p>
                    <p className="text-sm text-muted-foreground">${Number(it.product.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2 glass-strong rounded-lg p-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(it.id, it.quantity - 1)}><Minus className="h-3 w-3"/></Button>
                    <span className="w-6 text-center text-sm">{it.quantity}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(it.id, it.quantity + 1)}><Plus className="h-3 w-3"/></Button>
                  </div>
                  <div className="w-20 text-right font-semibold">${(Number(it.product.price) * it.quantity).toFixed(2)}</div>
                  <Button size="icon" variant="ghost" onClick={() => updateQty(it.id, 0)}><Trash2 className="h-4 w-4"/></Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 h-fit sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Order summary</h2>
            <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-4 text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="border-t pt-4 flex justify-between font-semibold text-lg mb-6"><span>Total</span><span className="gradient-text">${total.toFixed(2)}</span></div>
            <Button className="btn-glow w-full" size="lg" onClick={() => navigate({ to: "/checkout" })}>Proceed to Checkout</Button>
            <p className="text-xs text-muted-foreground text-center mt-3">You can review & confirm before placing the order.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
