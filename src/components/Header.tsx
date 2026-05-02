type Props = { totalQty: number; name: string; onCart: () => void; onProfile: () => void };

export function Header({ totalQty, name, onCart, onProfile }: Props) {
  const initial = name.charAt(0).toUpperCase() || "?";
  const first = name.split(" ")[0] || "";

  return (
    <header className="md:hidden bg-surface px-5 py-4 flex items-center justify-between sticky top-0 z-[100] border-b border-line shadow-sm">
      <div>
        <div className="text-[26px] font-black text-brand leading-none tracking-tight">SKT Stores</div>
        <div className="text-[13px] font-medium text-muted-text mt-1">Fresh food · Fast ordering</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onProfile}
          className="flex items-center gap-2 bg-brand/10 rounded-full pl-1.5 pr-4 py-1.5 transition-all active:scale-95"
        >
          <div className="w-[32px] h-[32px] bg-brand rounded-full flex items-center justify-center text-sm font-black text-brand-fg shadow-sm">
            {initial}
          </div>
          <span className="text-[13px] font-bold text-brand max-w-[80px] truncate">{first}</span>
        </button>
        <button
          onClick={onCart}
          className="bg-brand hover:bg-brand-hover text-brand-fg rounded-full pl-5 pr-3 py-2.5 font-extrabold text-[15px] flex items-center gap-2 transition-all active:scale-95"
          style={{ boxShadow: "0 4px 14px oklch(0.62 0.19 38 / 0.35)" }}
        >
          🛒
          <span className="bg-white text-brand rounded-full min-w-[24px] h-[24px] text-[12px] font-black flex items-center justify-center px-1">
            {totalQty}
          </span>
        </button>
      </div>
    </header>
  );
}
