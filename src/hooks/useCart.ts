import { useCallback, useEffect, useState } from "react";

const KEY = "skt_cart_v1";

type CartMap = Record<string, number>;

function load(): CartMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let memCart: CartMap = {};
const listeners = new Set<(c: CartMap) => void>();

function setAll(next: CartMap) {
  memCart = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l(next));
}

export function useCart() {
  const [cart, setCart] = useState<CartMap>(memCart);

  useEffect(() => {
    memCart = load();
    setCart(memCart);
    const l = (c: CartMap) => setCart({ ...c });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const next = { ...memCart };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    setAll(next);
  }, []);

  const add = useCallback((id: string) => setQty(id, 1), [setQty]);
  const inc = useCallback(
    (id: string, max: number) => setQty(id, Math.min((memCart[id] || 0) + 1, max)),
    [setQty],
  );
  const dec = useCallback((id: string) => setQty(id, (memCart[id] || 0) - 1), [setQty]);
  const remove = useCallback((id: string) => setQty(id, 0), [setQty]);
  const clear = useCallback(() => setAll({}), []);

  const totalQty = Object.values(cart).reduce((a, b) => a + (b > 0 ? b : 0), 0);

  return { cart, totalQty, setQty, add, inc, dec, remove, clear };
}
