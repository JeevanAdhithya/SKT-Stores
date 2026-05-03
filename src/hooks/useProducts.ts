import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export type SyncState = "wait" | "ok" | "err";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sync, setSync] = useState<SyncState>("wait");
  const [error, setError] = useState<string>("");
  const [updated, setUpdated] = useState(false);

  const fetchProducts = useCallback(async () => {
    let prevSnap = "";
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {
      setSync("err");
      setError(error.message);
      return;
    }

    const list: Product[] = data || [];
    const snapStr = JSON.stringify(list);
    if (prevSnap && snapStr !== prevSnap) {
      setUpdated(true);
      setTimeout(() => setUpdated(false), 3000);
    }
    prevSnap = snapStr;
    setProducts(list);
    setSync("ok");
    setError("");
  }, []);

  useEffect(() => {
    fetchProducts();

    // Subscribe to changes
    const channel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, sync, error, updated, refetch: fetchProducts };
}
