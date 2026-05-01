import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { ShopPage } from "@/components/ShopPage";
import { CartPage } from "@/components/CartPage";
import { OrdersPage } from "@/components/OrdersPage";
import { ProfilePage } from "@/components/ProfilePage";
import { ProductDetailPage } from "@/components/ProductDetailPage";
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
  const { cart, add, inc, dec, remove, clear } = useCart();
  const { orders, loading: ordersLoading } = useMyOrders(user?.uid);
  const [tab, setTab] = useState<Tab>("shop");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const realTotalQty = Object.entries(cart).reduce((sum, [id, qty]) => {
    const exists = products.find(p => p.id === id);
    return exists ? sum + qty : sum;
  }, 0);

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

  const onBuyNow = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p || p.stock === 0) return;
    if (!cart[id]) add(id);
    setSelectedProductId(null);
    setTab("cart");
  };

  const handlePlace = async ({
    items, subtotal, tax, delivery, total, note, phone, deliveryAddress, saveAsDefault, paymentMethod, transactionId
  }: {
    items: CartItem[]; subtotal: number; tax: number; delivery: number; total: number;
    note: string; phone: string; deliveryAddress: DeliveryAddress; saveAsDefault: boolean;
    paymentMethod: "cod" | "online"; transactionId?: string;
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
          paymentMethod,
          transactionId,
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

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetailPage 
          product={selectedProduct} 
          qtyInCart={cart[selectedProduct.id] || 0}
          onAdd={onAdd}
          onInc={onInc}
          onDec={dec}
          onBack={() => setSelectedProductId(null)}
          onBuyNow={onBuyNow}
        />
      );
    }

    switch (tab) {
      case "shop": return <ShopPage products={products} cart={cart} onAdd={onAdd} onInc={onInc} onDec={dec} onProductClick={setSelectedProductId} />;
      case "cart": return (
        <CartPage cart={cart} products={products} profile={profile}
          onInc={onInc} onDec={dec} onRemove={remove}
          onClear={() => { if (Object.keys(cart).length && confirm("Clear cart?")) clear(); }}
          onPlace={handlePlace} onBrowse={() => setTab("shop")} />
      );
      case "orders": return <OrdersPage orders={orders} loading={ordersLoading} onBrowse={() => setTab("shop")} />;
      case "profile": return <ProfilePage user={user} profile={profile} orders={orders} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-dvh bg-background overflow-x-hidden">
      <TopNav active={tab} cartCount={realTotalQty} name={profile.name} email={profile.email} onChange={(t) => { setSelectedProductId(null); setTab(t); }} />
      
      <main className="md:px-6 md:py-2">
        <div className="max-w-[1200px] mx-auto">
          {renderContent()}
        </div>
      </main>

      <BottomNav active={tab} cartCount={realTotalQty} onChange={(t) => { setSelectedProductId(null); setTab(t); }} />

      {submitting && <Loader msg="Sending your order..." />}
      {successId && (
        <SuccessModal orderId={successId} onClose={() => { setSuccessId(null); setTab("orders"); }} />
      )}
      <Toast />
    </div>
  );
}
