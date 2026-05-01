import { supabase } from "@/lib/supabase";
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
  // Insert order
  const { error: orderError } = await supabase.from("orders").insert({
    user_id: order.userId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    note: order.note,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    delivery: order.delivery,
    total: order.total,
    status: order.status,
    delivery_address: order.deliveryAddress,
    payment_method: order.paymentMethod,
    transaction_id: order.transactionId,
  });

  if (orderError) throw orderError;

  // Update stock levels
  for (const item of order.items) {
    const p = products.find((x) => x.id === item.id);
    if (p) {
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: Math.max(0, p.stock - item.qty) })
        .eq("id", item.id);
      
      if (stockError) console.error("Stock update failed for", item.id, stockError);
    }
  }
}
