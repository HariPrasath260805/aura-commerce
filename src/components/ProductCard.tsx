import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface ProductLite {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock?: number;
}

export function ProductCard({ product, onChange }: { product: ProductLite; onChange?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const requireAuth = () => {
    if (!user) {
      toast.error("Please sign in first");
      navigate({ to: "/auth" });
      return false;
    }
    return true;
  };

  const addToCart = async () => {
    if (!requireAuth()) return;
    setAdding(true);
    const { data: existing } = await supabase
      .from("cart").select("id, quantity").eq("user_id", user!.id).eq("product_id", product.id).maybeSingle();
    if (existing) {
      await supabase.from("cart").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart").insert({ user_id: user!.id, product_id: product.id, quantity: 1 });
    }
    setAdding(false);
    setAdded(true);
    toast.success("Added to cart");
    onChange?.();
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = async () => {
    if (!requireAuth()) return;
    if (wished) {
      await supabase.from("wishlist").delete().eq("user_id", user!.id).eq("product_id", product.id);
      setWished(false);
    } else {
      await supabase.from("wishlist").upsert({ user_id: user!.id, product_id: product.id });
      setWished(true);
      toast.success("Added to wishlist");
    }
    onChange?.();
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="glass rounded-2xl overflow-hidden group flex flex-col"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-violet)]/20" />
        )}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.preventDefault(); toggleWishlist(); }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full glass-strong grid place-items-center"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 transition ${wished ? "fill-[var(--neon-pink)] text-[var(--neon-pink)]" : ""}`} />
        </motion.button>
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link to="/product/$id" params={{ id: product.id }} className="font-medium leading-snug line-clamp-2 hover:text-primary transition-colors">
          {product.name}
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-semibold gradient-text">${Number(product.price).toFixed(2)}</span>
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button size="sm" className="btn-glow" disabled={adding} onClick={addToCart}>
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
