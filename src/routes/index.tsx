import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Search, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductLite } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA.shop — Step into the future of shopping" },
      { name: "description", content: "An animated, glassy storefront with curated products, smooth checkout, and instant order tracking." },
    ],
  }),
  component: Home,
});

interface Cat { id: string; name: string; }

function Home() {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("products").select("id,name,price,image_url,stock").limit(8).then(({ data }) => setProducts(data ?? []));
    supabase.from("categories").select("id,name").then(({ data }) => setCats(data ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden animated-bg">
        <div className="orb h-72 w-72 bg-[var(--neon-violet)] -top-10 -left-10" />
        <div className="orb h-96 w-96 bg-[var(--neon-cyan)] top-20 right-0" style={{ animationDelay: "3s" }} />
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[var(--neon-cyan)]" />
              New arrivals every week
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Shop the <span className="gradient-text">future</span>,
              <br />delivered today.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              A curated catalog wrapped in glass, motion, and a touch of neon. Premium products, frictionless checkout.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/category", search: { q, cat: "" } }); }}
              className="mt-8 flex gap-2 max-w-md"
            >
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="glass border-border h-12" />
              <Button type="submit" size="lg" className="btn-glow"><Search className="h-4 w-4" /></Button>
            </form>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[var(--neon-cyan)]"/>Free shipping over $50</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--neon-violet)]"/>Secure checkout</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-6">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/category"
                search={{ cat: c.id, q: "" }}
                className="glass rounded-2xl p-6 flex flex-col items-start hover:-translate-y-1 transition-transform"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Explore</span>
                <span className="mt-2 text-xl font-semibold">{c.name}</span>
                <ArrowRight className="mt-6 h-4 w-4 text-primary" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured products</h2>
          <Link to="/category" search={{ q: "", cat: "" }} className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet. Admin can add some from the dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
