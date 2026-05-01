type Props = { orderId: string; onClose: () => void };

export function SuccessModal({ orderId, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/70 flex items-end justify-center">
      <div className="bg-surface rounded-t-[24px] px-6 pt-7 pb-[max(2.25rem,env(safe-area-inset-bottom))] w-full max-w-[430px] text-center animate-slide-up">
        <span className="block text-[68px] mb-2.5">🎉</span>
        <h2 className="text-[26px] font-black mb-2">Order Placed!</h2>
        <p className="text-sm text-muted-text mb-4 leading-relaxed">
          Your order has been sent to the kitchen. The store will see it right now on their
          screen!
        </p>
        <div className="bg-surface-muted rounded-[11px] px-5 py-3 mb-5 text-[13px] font-extrabold text-brand tracking-wider font-mono border border-line">
          {orderId}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-brand hover:bg-brand-hover text-brand-fg rounded-[13px] py-4 font-extrabold text-[15px] transition-colors"
        >
          Track My Order →
        </button>
      </div>
    </div>
  );
}
