import { ChevronLeft } from "lucide-react";
import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pending Verification",
  confirmed: "✅ Order Confirmed",
  delivered: "🎉 Delivered",
  cancelled: "❌ Cancelled",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

type Props = { orders: Order[]; loading: boolean; onBrowse: () => void };

export function OrdersPage({ orders, loading, onBrowse }: Props) {
  return (
    <div className="animate-fade-up pb-[100px] md:pb-10 w-full px-6 md:px-10">
      {/* Back Button */}
      <div className="pt-6 mb-6">
        <button
          onClick={onBrowse}
          className="group flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-brand/30 transition-all active:scale-95 mb-6"
        >
          <ChevronLeft size={18} className="text-brand group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-brand">Back to Shop</span>
        </button>
        <h2 className="text-3xl font-black tracking-tight">📦 My Orders</h2>
        <p className="text-gray-400 font-bold">Track and manage your shopping history</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold">Fetching your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
          <div className="text-7xl mb-6">📦</div>
          <h3 className="text-2xl font-black mb-2">No orders found</h3>
          <p className="text-gray-400 font-bold mb-8">Your shopping history will appear here once you place an order.</p>
          <button onClick={onBrowse}
            className="bg-brand hover:bg-brand-hover text-white rounded-[24px] px-10 py-4 font-black text-lg transition-all active:scale-95 shadow-lg shadow-brand/20">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((o) => {
            const d = new Date(o.createdAt).toLocaleString("en-IN", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            });
            return (
              <div key={o.id} className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[10px] font-black text-gray-300 font-mono tracking-widest uppercase mb-1">Order #{o.id.slice(-8).toUpperCase()}</div>
                    <div className="text-xs text-gray-400 font-bold">{d}</div>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${STATUS_CLASS[o.status] || 'bg-gray-100'}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>

                <div className="bg-[#f4f7f9] rounded-2xl p-4 mb-6 space-y-3">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</div>
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-700">{i.emoji || "🛍️"} {i.name}</span>
                      <span className="text-gray-400">×{i.qty}</span>
                    </div>
                  ))}
                </div>

                {o.deliveryAddress && (
                  <div className="flex gap-2 text-[11px] text-gray-500 font-bold mb-6">
                    <span>📍</span>
                    <span className="leading-relaxed">{o.deliveryAddress.address}, {o.deliveryAddress.city} - {o.deliveryAddress.pincode}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-brand">₹{o.total}</span>
                  </div>
                  {o.paymentMethod === 'online' && (
                    <div className="text-right">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Transaction ID</span>
                      <div className="text-xs font-mono font-bold text-blue-600">{o.transactionId || 'Pending'}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
