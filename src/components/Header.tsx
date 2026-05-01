type Props = { totalQty: number; name: string; onCart: () => void; onProfile: () => void };

export function Header({ totalQty, name, onCart, onProfile }: Props) {
  const initial = name.charAt(0).toUpperCase() || "?";
  const first = name.split(" ")[0] || "";

  return (
    <header className="md:hidden bg-surface px-3.5 py-3 flex items-center justify-between sticky top-0 z-[100] border-b border-line">
      <div>
        <div className="text-[22px] font-black text-brand leading-none">SKT Stores</div>
        <div className="text-[11px] text-muted-text mt-0.5">Fresh food · Fast ordering</div>
      </div>
      <div className="flex items-center">
        <button
          onClick={onProfile}
          className="flex items-center gap-1.5 bg-brand/10 rounded-full pl-1 pr-3 py-1 mr-1.5"
        >
          <div className="w-[27px] h-[27px] bg-brand rounded-full flex items-center justify-center text-xs font-black text-brand-fg">
            {initial}
          </div>
          <span className="text-xs font-bold text-brand max-w-[70px] truncate">{first}</span>
        </button>
        <button
          onClick={onCart}
          className="bg-brand hover:bg-brand-hover text-brand-fg rounded-full pl-4 pr-2 py-2 font-extrabold text-[13px] flex items-center gap-1.5 transition-colors"
          style={{ boxShadow: "0 3px 12px oklch(0.62 0.19 38 / 0.3)" }}
        >
          🛒
          <span className="bg-white text-brand rounded-full min-w-[21px] h-[21px] text-[11px] font-black flex items-center justify-center px-1">
            {totalQty}
          </span>
        </button>
      </div>
    </header>
  );
}
