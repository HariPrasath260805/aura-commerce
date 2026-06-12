import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} NOVA.shop — Crafted with care.</p>
      </footer>
    </div>
  );
}
