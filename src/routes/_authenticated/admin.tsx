import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Package, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — NOVA.shop" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/" }); }, [isAdmin, loading, navigate]);
  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Loading…</div>;
  if (!isAdmin) return null;
  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"><LayoutDashboard /> Admin</h1>
        <nav className="flex gap-1 mt-4 glass rounded-lg p-1 w-fit">
          <NavTab to="/admin">Dashboard</NavTab>
          <NavTab to="/admin/products"><ShoppingBag className="h-4 w-4" /> Products</NavTab>
          <NavTab to="/admin/orders"><Package className="h-4 w-4" /> Orders</NavTab>
        </nav>
      </motion.div>
      <Outlet />
    </div>
  );
}

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to as any} className="px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-secondary transition-colors"
      activeProps={{ className: "bg-secondary text-foreground" }} activeOptions={{ exact: true }}>
      {children}
    </Link>
  );
}
