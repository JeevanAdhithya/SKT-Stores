import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { ShopPage } from "@/components/ShopPage";
import { CartPage } from "@/components/CartPage";
import { OrdersPage } from "@/components/OrdersPage";
import { ProfilePage } from "@/components/ProfilePage";
import { SuccessModal } from "@/components/SuccessModal";
import { Toast, showToast } from "@/components/Toast";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useMyOrders } from "@/hooks/useMyOrders";
import { newOrderId, placeOrder } from "@/lib/orders";
import { updateProfile } from "@/lib/auth";
import type { CartItem, DeliveryAddress } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "shop" | "cart" | "orders" | "profile";

function Index() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { products } = useProducts();
  const { cart, totalQty, add, inc, dec, remove, clear } = useCart();
  const { orders, loading: ordersLoading } = useMyOrders(user?.uid);
  const [tab, setTab] = useState<Tab>("shop");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-muted-text text-sm">Loading...</div>
      </div>
    );
  }

  const onAdd = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p || p.stock === 0) return;
    add(id);
    showToast(`Added ${p.name}!`, "green");
  };

  const onInc = (id: string, max: number) => {
    if ((cart[id] || 0) >= max) {
      showToast("Max stock reached!", "red");
      return;
    }
    inc(id, max);
  };

  const handlePlace = async ({
    items, subtotal, tax, delivery, total, note, phone, deliveryAddress, saveAsDefault,
  }: {
    items: CartItem[]; subtotal: number; tax: number; delivery: number; total: number;
    note: string; phone: string; deliveryAddress: DeliveryAddress; saveAsDefault: boolean;
  }) => {
    if (items.length === 0) return;
    setSubmitting(true);
    const orderId = newOrderId();
    try {
      await placeOrder(
        {
          id: orderId,
          userId: user.uid,
          customerName: profile.name,
          customerPhone: phone,
          note,
          items,
          subtotal,
          tax,
          delivery,
          total,
          status: "pending",
          createdAt: new Date().toISOString(),
          deliveryAddress,
        },
        products,
      );
      const patch: Record<string, string> = {};
      if (phone && phone !== profile.phone) patch.phone = phone;
      if (saveAsDefault) {
        patch.address = deliveryAddress.address;
        patch.city = deliveryAddress.city;
        patch.pincode = deliveryAddress.pincode;
      }
      if (Object.keys(patch).length) {
        try { await updateProfile(profile.uid, patch); } catch {}
      }
      clear();
      setSuccessId(orderId);
    } catch (e) {
      showToast("⚠ Failed to send order: " + (e instanceof Error ? e.message.slice(0, 40) : ""), "red");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden">
      <TopNav active={tab} cartCount={totalQty} name={profile.name} email={profile.email} onChange={setTab} />
      
      <main className="md:px-6 md:py-2">
        <div className="md:hidden max-w-[430px] mx-auto">
          {tab === "shop" && <ShopPage products={products} cart={cart} onAdd={onAdd} onInc={onInc} onDec={dec} />}
          {tab === "cart" && (
            <CartPage cart={cart} products={products} profile={profile}
              onInc={onInc} onDec={dec} onRemove={remove}
              onClear={() => { if (Object.keys(cart).length && confirm("Clear cart?")) clear(); }}
              onPlace={handlePlace} onBrowse={() => setTab("shop")} />
          )}
          {tab === "orders" && <OrdersPage orders={orders} loading={ordersLoading} onBrowse={() => setTab("shop")} />}
          {tab === "profile" && <ProfilePage user={user} profile={profile} orders={orders} />}
        </div>
        <div className="hidden md:block">
          {tab === "shop" && <ShopPage products={products} cart={cart} onAdd={onAdd} onInc={onInc} onDec={dec} />}
          {tab === "cart" && (
            <CartPage cart={cart} products={products} profile={profile}
              onInc={onInc} onDec={dec} onRemove={remove}
              onClear={() => { if (Object.keys(cart).length && confirm("Clear cart?")) clear(); }}
              onPlace={handlePlace} onBrowse={() => setTab("shop")} />
          )}
          {tab === "orders" && <OrdersPage orders={orders} loading={ordersLoading} onBrowse={() => setTab("shop")} />}
          {tab === "profile" && <ProfilePage user={user} profile={profile} orders={orders} />}
        </div>
      </main>

      <BottomNav active={tab} cartCount={totalQty} onChange={setTab} />

      {submitting && <Loader msg="Sending your order..." />}
      {successId && (
        <SuccessModal orderId={successId} onClose={() => { setSuccessId(null); setTab("orders"); }} />
      )}
      <Toast />
    </div>
  );
}
