import { useEffect, useState } from "react";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import { getDB } from "@/lib/firebase";
import type { Order } from "@/lib/types";

export function useMyOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getDB();
    const q = query(ref(db, "orders"), orderByChild("userId"), equalTo(userId));
    const unsub = onValue(
      q,
      (snap) => {
        const data = (snap.val() as Record<string, Order>) || {};
        const mine = Object.values(data).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(mine);
        setLoading(false);
        setError("");
      },
      (err) => {
        setLoading(false);
        setError(err.message);
      },
    );
    return () => unsub();
  }, [userId]);

  return { orders, loading, error };
}
