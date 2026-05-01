import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  onClick: () => void;
};

export function ProductCard({ product, qty, onAdd, onInc, onDec, onClick }: Props) {
  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 5;
  const stockLabel = out ? "✗ Sold Out" : low ? `⚠ Only ${product.stock}` : "✓ Available";
  const stockClass = out
    ? "bg-danger-bg/80 text-danger border-danger/20"
    : low
    ? "bg-warn-bg/80 text-warn border-warn/20"
    : "bg-ok-bg/80 text-ok border-ok/20";

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-surface rounded-[20px] border border-line/60 overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        out ? "opacity-75 grayscale-[0.2]" : ""
      }`}
    >
      <div className="w-full aspect-square overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-surface-muted/50 to-line/30 group-hover:from-surface-muted group-hover:to-line/50 transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="relative transform transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-3 group-hover:drop-shadow-xl">
             <div className="absolute inset-0 bg-brand/20 blur-[30px] rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <span className="text-[64px] relative z-10 drop-shadow-md">{product.emoji || "📦"}</span>
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-brand/90 backdrop-blur-md text-brand-fg rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-lg z-20">
            {product.tag}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="text-[15px] font-extrabold leading-snug mb-1 line-clamp-2 group-hover:text-brand transition-colors">
            {product.name}
          </div>
          <div className="text-[11px] font-semibold text-muted-text/80 mb-2 uppercase tracking-wider">{product.category}</div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div className="text-xl font-black text-foreground">
              <span className="text-brand text-sm mr-0.5">₹</span>{product.price}
            </div>
            <div
              className={`text-[9px] font-extrabold px-2 py-1 rounded-full border ${stockClass}`}
            >
              {stockLabel}
            </div>
          </div>

          {qty > 0 ? (
            <div className="flex items-center justify-between bg-surface-muted/50 rounded-xl overflow-hidden border border-line/50 p-1">
              <button
                onClick={(e) => { e.stopPropagation(); onDec(); }}
                className="bg-white dark:bg-black hover:bg-brand hover:text-brand-fg text-foreground w-[36px] h-[36px] rounded-lg text-lg font-black flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                −
              </button>
              <span className="text-[16px] font-black w-8 text-center">{qty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onInc(); }}
                disabled={qty >= product.stock}
                className="bg-white dark:bg-black hover:bg-brand disabled:hover:bg-white disabled:hover:text-muted-text disabled:opacity-50 hover:text-brand-fg text-foreground w-[36px] h-[36px] rounded-lg text-lg font-black flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              disabled={out}
              className="w-full bg-surface-muted hover:bg-brand text-foreground hover:text-brand-fg disabled:opacity-50 rounded-xl py-2.5 font-extrabold text-[14px] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
