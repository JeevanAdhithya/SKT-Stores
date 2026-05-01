import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
    
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        const list: Order[] = (data || []).map(d => ({
          id: d.id,
          userId: d.user_id,
          customerName: d.customer_name,
          customerPhone: d.customer_phone,
          note: d.note,
          items: d.items,
          subtotal: d.subtotal,
          tax: d.tax,
          delivery: d.delivery,
          total: d.total,
          status: d.status,
          createdAt: d.created_at,
          deliveryAddress: d.delivery_address,
        }));
        setOrders(list);
      }
      setLoading(false);
    };

    fetchOrders();

    // Optional: Real-time updates for orders
    const channel = supabase
      .channel(`orders_${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { orders, loading, error };
}
