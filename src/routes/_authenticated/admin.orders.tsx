import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type OrderStatus = "Order Placed" | "Shipping" | "Ready for Delivery" | "Delivered";
const STATUSES: OrderStatus[] = ["Order Placed", "Shipping", "Ready for Delivery", "Delivered"];

interface Order {
  id: string; status: OrderStatus; total: number; created_at: string;
  name: string; phone: string; address: string;
  order_items: { id: string; product_name: string; quantity: number; price: number }[];
}

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const { data } = await supabase.from("orders")
      .select("id, status, total, created_at, name, phone, address, order_items(id,product_name,quantity,price)")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as any);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); load(); }
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 && <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No orders yet.</div>}
      {orders.map(o => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}</p>
              <p className="font-medium mt-1">{o.name}</p>
              <p className="text-sm text-muted-foreground">{o.phone}</p>
              <p className="text-sm text-muted-foreground">{o.address}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-semibold text-lg gradient-text">${Number(o.total).toFixed(2)}</div>
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-t pt-3 space-y-1">
            {o.order_items.map(i => (
              <div key={i.id} className="text-sm flex justify-between">
                <span>{i.product_name} × {i.quantity}</span>
                <span className="text-muted-foreground">${(Number(i.price) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
