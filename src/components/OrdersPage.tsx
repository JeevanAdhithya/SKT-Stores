import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "⏳ Pending",
  accepted: "✅ Accepted",
  completed: "🎉 Ready!",
  rejected: "❌ Rejected",
};
const STATUS_CLASS: Record<Order["status"], string> = {
  pending: "bg-warn-bg text-warn",
  accepted: "bg-info-bg text-info",
  completed: "bg-ok-bg text-ok",
  rejected: "bg-danger-bg text-danger",
};

type Props = { orders: Order[]; loading: boolean; onBrowse: () => void };

export function OrdersPage({ orders, loading, onBrowse }: Props) {
  return (
    <div className="animate-fade-up pb-[100px] md:pb-10 max-w-[1100px] mx-auto w-full">
      <div className="px-3.5 md:px-0 pt-3.5 flex justify-between items-center">
        <div className="text-[19px] md:text-2xl font-extrabold">📦 My Orders</div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-text">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center px-5 py-20">
          <div className="text-5xl mb-3">📦</div>
          <h3 className="text-xl font-extrabold mb-2">No orders yet</h3>
          <p className="text-muted-text mb-5">Your orders appear here</p>
          <button onClick={onBrowse}
            className="bg-brand hover:bg-brand-hover text-brand-fg rounded-[11px] px-8 py-3 font-extrabold text-[15px] transition-colors">
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="p-3.5 md:px-0 grid lg:grid-cols-2 gap-3 md:gap-4">
          {orders.map((o) => {
            const d = new Date(o.createdAt).toLocaleString("en-IN", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            });
            return (
              <div key={o.id} className="bg-surface rounded-[14px] border-[1.5px] border-line p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[11px] font-bold text-soft-text font-mono">{o.id}</div>
                    <div className="text-[11px] text-soft-text mt-0.5">{d}</div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${STATUS_CLASS[o.status]}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
                <div className="text-[13px] text-muted-text mb-1.5 leading-relaxed">
                  {o.items.map((i) => `${i.emoji || "🍴"} ${i.name} ×${i.qty}`).join(" · ")}
                </div>
                {o.deliveryAddress && (
                  <div className="text-[11px] text-muted-text mb-1.5">
                    📍 {o.deliveryAddress.address}, {o.deliveryAddress.city} - {o.deliveryAddress.pincode}
                  </div>
                )}
                {o.note && <div className="text-[11px] text-warn mb-1.5 italic">📝 {o.note}</div>}
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-soft-text">{o.items.length} item{o.items.length>1?"s":""}</span>
                  <span className="text-base font-black text-brand">₹{o.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
