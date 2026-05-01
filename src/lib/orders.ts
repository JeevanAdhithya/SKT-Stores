import { ref, set, update } from "firebase/database";
import { getDB } from "@/lib/firebase";
import type { Order, Product } from "@/lib/types";

export function newOrderId() {
  return (
    "ORD-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(-3).toUpperCase()
  );
}

export async function placeOrder(order: Order, products: Product[]) {
  const db = getDB();
  await set(ref(db, "orders/" + order.id), order);

  const stockUpdates: Record<string, number> = {};
  order.items.forEach((item) => {
    const p = products.find((x) => x.id === item.id);
    if (p) stockUpdates["products/" + item.id + "/stock"] = Math.max(0, p.stock - item.qty);
  });
  if (Object.keys(stockUpdates).length > 0) {
    await update(ref(db), stockUpdates);
  }
}
