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

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col cursor-pointer"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {product.img ? (
          <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-[60px]">{product.emoji || "📦"}</span>
        )}
        {product.tag && (
          <span className="absolute top-2 left-2 bg-brand text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-0.5">
        <h3 className="text-[14px] font-black text-gray-900 truncate" title={product.name}>{product.name}</h3>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</p>
        
        <div className="flex items-center gap-2 mt-1 mb-2">
          <div className="text-base font-black text-brand">₹{product.price}</div>
          {(product.original_price ?? 0) > product.price && (
            <div className="text-[10px] text-gray-400 line-through font-bold">₹{product.original_price}</div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mb-3">
           <div className="w-3.5 h-3.5 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-[7px]">✓</div>
           <span className="text-[8px] font-bold text-green-500 uppercase">Available</span>
        </div>

        {qty > 0 ? (
          <div className="flex items-center justify-between bg-gray-100 p-1 rounded-xl">
            <button onClick={(e) => { e.stopPropagation(); onDec(); }} className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-base active:scale-90 transition-all">−</button>
            <span className="font-black text-sm">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); onInc(); }} className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-base active:scale-90 transition-all">+</button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            disabled={out}
            className="w-full bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 disabled:opacity-50"
          >
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
