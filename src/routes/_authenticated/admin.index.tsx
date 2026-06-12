import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [p, o, u] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (o.data ?? []).reduce((s, r: any) => s + Number(r.total), 0);
      setStats({ products: p.count ?? 0, orders: o.data?.length ?? 0, users: u.count ?? 0, revenue });
    })();
  }, []);

  const cards = [
    { label: "Products", value: stats.products },
    { label: "Orders", value: stats.orders },
    { label: "Customers", value: stats.users },
    { label: "Revenue", value: `$${stats.revenue.toFixed(2)}` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="glass rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">{c.label}</p>
          <p className="mt-2 text-3xl font-bold gradient-text">{c.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
