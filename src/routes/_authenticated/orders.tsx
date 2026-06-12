import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type OrderStatus = "Order Placed" | "Shipping" | "Ready for Delivery" | "Delivered";
interface OrderItem { id: string; product_name: string; product_image: string; quantity: number; price: number; }
interface Order { id: string; status: OrderStatus; total: number; created_at: string; order_items: OrderItem[]; }

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Your orders — NOVA.shop" }] }),
  component: OrdersPage,
});

const statusColor: Record<OrderStatus, string> = {
  "Order Placed": "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border-[var(--neon-cyan)]/40",
  "Shipping": "bg-[var(--neon-violet)]/20 text-[var(--neon-violet)] border-[var(--neon-violet)]/40",
  "Ready for Delivery": "bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] border-[var(--neon-pink)]/40",
  "Delivered": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("orders")
        .select("id, status, total, created_at, order_items(id,product_name,product_image,quantity,price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as any);
    };
    load();
    const ch = supabase.channel("orders-user").on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
      () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Package /> Your orders</h1>
      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-sm">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <motion.span
                  key={o.status}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-xs px-3 py-1 rounded-full border ${statusColor[o.status]}`}
                >
                  {o.status}
                </motion.span>
                <div className="font-semibold">${Number(o.total).toFixed(2)}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {o.order_items.map(i => (
                  <div key={i.id} className="flex gap-3 items-center text-sm">
                    <div className="h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                      {i.product_image && <img src={i.product_image} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{i.product_name}</p>
                      <p className="text-xs text-muted-foreground">×{i.quantity} · ${Number(i.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
