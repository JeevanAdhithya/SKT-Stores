import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          uid: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          createdAt: data.created_at,
        });
      } else if (!error && !data) {
        // Create profile for new OAuth users
        const metadata = user.user_metadata;
        const newProfile = {
          id: user.id,
          name: metadata?.full_name || user.email?.split('@')[0] || 'User',
          username: metadata?.username || user.email?.split('@')[0] + Math.floor(Math.random() * 1000),
          email: user.email,
          phone: '',
          address: '',
          city: '',
          pincode: '',
        };
        const { error: insertError } = await supabase.from("profiles").insert(newProfile);
        if (!insertError) {
           setProfile({
             uid: user.id,
             ...newProfile,
             createdAt: new Date().toISOString()
           } as any);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { user, profile, loading };
}
