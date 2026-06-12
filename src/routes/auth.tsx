import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — NOVA.shop" }] }),
  component: AuthPage,
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be ≥ 6 chars").max(72),
  phone: z.string().trim().min(5, "Phone required").max(20),
  address: z.string().trim().min(5, "Address required").max(300),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 relative overflow-hidden">
      <div className="orb h-72 w-72 bg-[var(--neon-violet)] top-10 -left-10" />
      <div className="orb h-72 w-72 bg-[var(--neon-cyan)] bottom-10 -right-10" style={{ animationDelay: "2s" }}/>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl w-full max-w-md p-8 relative">
        <h1 className="text-2xl font-bold mb-1">Welcome to <span className="gradient-text">NOVA</span></h1>
        <p className="text-sm text-muted-foreground mb-6">
          {tab === "login" ? "Sign in to continue shopping." : "Create your account to get started."}
        </p>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login"><LoginForm /></TabsContent>
          <TabsContent value="register"><RegisterForm onDone={() => setTab("login")} /></TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="li-email">Email</Label>
        <Input id="li-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="li-pw">Password</Label>
        <Input id="li-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full btn-glow" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: form.name, phone: form.phone, address: form.address },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    // sign out the auto-session so user must log in explicitly (per spec)
    await supabase.auth.signOut();
    toast.success("Account created — please sign in");
    onDone();
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Name</Label><Input required value={form.name} onChange={update("name")} /></div>
      <div><Label>Email</Label><Input type="email" required value={form.email} onChange={update("email")} /></div>
      <div><Label>Password</Label><Input type="password" required value={form.password} onChange={update("password")} /></div>
      <div><Label>Phone</Label><Input required value={form.phone} onChange={update("phone")} /></div>
      <div><Label>Address</Label><Input required value={form.address} onChange={update("address")} /></div>
      <Button type="submit" className="w-full btn-glow" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
