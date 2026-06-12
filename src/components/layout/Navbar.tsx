import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, User as UserIcon, Sun, Moon, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [dark]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const NavLinks = (
    <>
      <Link to="/" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Home</Link>
      <Link to="/category" className="text-sm hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Shop</Link>
      {user && <Link to="/orders" className="text-sm hover:text-primary transition-colors">Orders</Link>}
      {isAdmin && <Link to="/admin" className="text-sm hover:text-primary transition-colors flex items-center gap-1"><LayoutDashboard className="h-4 w-4" />Admin</Link>}
    </>
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-strong border-b"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] shadow-[var(--shadow-glow)]" />
          <span className="font-bold text-lg tracking-tight">NOVA<span className="gradient-text">.shop</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">{NavLinks}</nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && (
            <>
              <Link to="/wishlist"><Button variant="ghost" size="icon" aria-label="Wishlist"><Heart className="h-5 w-5" /></Button></Link>
              <Link to="/cart"><Button variant="ghost" size="icon" aria-label="Cart"><ShoppingBag className="h-5 w-5" /></Button></Link>
              <Link to="/profile"><Button variant="ghost" size="icon" aria-label="Profile"><UserIcon className="h-5 w-5" /></Button></Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
            </>
          )}
          {!user && (
            <Link to="/auth" className="ml-1">
              <Button className="btn-glow">Sign in</Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3" onClick={() => setOpen(false)}>
              {NavLinks}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
