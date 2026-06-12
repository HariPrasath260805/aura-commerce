import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Profile { id: string; name: string; email: string; phone: string; address: string; }

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — NOVA.shop" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setProfile(data as Profile); setPhone(data.phone); setAddress(data.address); }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ phone, address, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  if (!profile) return <div className="container mx-auto px-4 py-12">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-1">Your profile</h1>
        <p className="text-muted-foreground mb-8">Keep your delivery details up to date.</p>
        <div className="space-y-5">
          <div><Label>Name</Label><Input value={profile.name} disabled /></div>
          <div><Label>Email</Label><Input value={profile.email} disabled /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Address</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} /></div>
          <Button className="btn-glow w-full" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </motion.div>
    </div>
  );
}
