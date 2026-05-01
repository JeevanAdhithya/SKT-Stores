import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getDB } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export type SyncState = "wait" | "ok" | "err";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sync, setSync] = useState<SyncState>("wait");
  const [error, setError] = useState<string>("");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let firstLoad = true;
    let prevSnap = "";
    const db = getDB();
    const productsRef = ref(db, "products");
    const unsub = onValue(
      productsRef,
      (snap) => {
        const data = snap.val();
        const list: Product[] = data ? Object.values(data) : [];
        const snapStr = JSON.stringify(list);
        if (!firstLoad && snapStr !== prevSnap) {
          setUpdated(true);
          setTimeout(() => setUpdated(false), 3000);
        }
        prevSnap = snapStr;
        firstLoad = false;
        setProducts(list);
        setSync("ok");
        setError("");
      },
      (err) => {
        setSync("err");
        setError(err.message);
      },
    );
    return () => unsub();
  }, []);

  return { products, sync, error, updated };
}
