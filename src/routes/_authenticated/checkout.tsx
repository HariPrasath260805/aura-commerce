import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; image_url: string };
}
interface Profile { name: string; phone: string; address: string; }

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — NOVA.shop" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("cart").select("id, quantity, product:products(id,name,price,image_url)").eq("user_id", user.id)
      .then(({ data }) => setItems((data ?? []) as any));
    supabase.from("profiles").select("name, phone, address").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as Profile));
  }, [user]);

  const total = items.reduce((s, it) => s + Number(it.product.price) * it.quantity, 0);

  const placeOrder = async () => {
    if (!user || !profile || items.length === 0) return;
    if (!profile.phone || !profile.address) {
      toast.error("Please complete your phone & address in profile first");
      navigate({ to: "/profile" });
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
    }).select().single();
    if (error || !order) { setPlacing(false); toast.error(error?.message ?? "Failed"); return; }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map(it => ({
        order_id: order.id,
        product_id: it.product.id,
        product_name: it.product.name,
        product_image: it.product.image_url,
        quantity: it.quantity,
        price: it.product.price,
      }))
    );
    if (itemsErr) { setPlacing(false); toast.error(itemsErr.message); return; }

    await supabase.from("cart").delete().eq("user_id", user.id);
    setPlacing(false);
    toast.success("Your order has been placed successfully");
    navigate({ to: "/orders" });
  };

  if (items.length === 0) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <p className="text-muted-foreground mb-4">Your cart is empty.</p>
      <Link to="/category" search={{ q: "", cat: "" }}><Button className="btn-glow">Browse products</Button></Link>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>
      <h1 className="text-3xl font-bold mb-6">Review your order</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {it.product.image_url && <img src={it.product.image_url} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{it.product.name}</p>
                <p className="text-sm text-muted-foreground">Qty {it.quantity} × ${Number(it.product.price).toFixed(2)}</p>
              </div>
              <div className="font-semibold">${(Number(it.product.price) * it.quantity).toFixed(2)}</div>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 h-fit space-y-5">
          <div>
            <h2 className="font-semibold mb-2">Delivery to</h2>
            <p className="text-sm">{profile?.name}</p>
            <p className="text-sm text-muted-foreground">{profile?.phone}</p>
            <p className="text-sm text-muted-foreground">{profile?.address}</p>
            <Link to="/profile" className="text-xs text-primary hover:underline">Edit profile</Link>
          </div>
          <div className="border-t pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span><span className="gradient-text">${total.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Button className="btn-glow w-full" size="lg" disabled={placing} onClick={placeOrder}>
              {placing ? "Placing…" : "Place Order"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/cart" })}>Back to Cart</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
