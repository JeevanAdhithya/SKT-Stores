import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { getAuthInstance, getDB } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = onAuthStateChanged(getAuthInstance(), (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onValue(ref(getDB(), "users/" + user.uid), (snap) => {
      setProfile(snap.val() as UserProfile | null);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return { user, profile, loading };
}
