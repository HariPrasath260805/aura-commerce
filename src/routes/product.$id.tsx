import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface Product {
  id: string; name: string; description: string; price: number; image_url: string; stock: number;
}

export const Route = createFileRoute("/product/$id")({
  component: ProductDetails,
});

function ProductDetails() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => setProduct(data as Product));
  }, [id]);

  const requireAuth = () => {
    if (!user) { toast.error("Please sign in"); navigate({ to: "/auth" }); return false; }
    return true;
  };

  const addToCart = async () => {
    if (!requireAuth() || !product) return;
    const { data: existing } = await supabase.from("cart").select("id, quantity").eq("user_id", user!.id).eq("product_id", product.id).maybeSingle();
    if (existing) {
      await supabase.from("cart").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({ user_id: user!.id, product_id: product.id, quantity: qty });
    }
    toast.success("Added to cart");
  };

  const addToWishlist = async () => {
    if (!requireAuth() || !product) return;
    await supabase.from("wishlist").upsert({ user_id: user!.id, product_id: product.id });
    toast.success("Added to wishlist");
  };

  if (!product) return <div className="container mx-auto px-4 py-12">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/category" search={{ q: "", cat: "" }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl overflow-hidden aspect-square">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-violet)]/20" />
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-4 text-3xl font-semibold gradient-text">${Number(product.price).toFixed(2)}</div>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description || "No description provided."}</p>
          <p className="mt-4 text-sm text-muted-foreground">In stock: {product.stock}</p>

          <div className="mt-8 flex items-center gap-3">
            <div className="glass rounded-lg flex items-center">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2">−</button>
              <span className="px-4 font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2">+</button>
            </div>
            <Button className="btn-glow flex-1" size="lg" onClick={addToCart}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Add to cart
            </Button>
            <Button variant="outline" size="lg" onClick={addToWishlist}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
