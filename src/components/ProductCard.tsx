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
      className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col cursor-pointer"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {product.img ? (
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[80px]">{product.emoji || "📦"}</span>
        )}
        {product.tag && (
          <span className="absolute top-4 left-4 bg-brand text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-1">
        <h3 className="text-[17px] font-black text-gray-900 truncate">{product.name}</h3>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</p>
        <div className="text-xl font-black text-brand mb-2">₹{product.price}</div>
        
        <div className="flex items-center gap-1.5 mb-4">
           <div className="w-4 h-4 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-[8px]">✓</div>
           <span className="text-[10px] font-bold text-green-500 uppercase">Available</span>
        </div>

        {qty > 0 ? (
          <div className="flex items-center justify-between bg-gray-100 p-1 rounded-2xl">
            <button onClick={(e) => { e.stopPropagation(); onDec(); }} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-lg active:scale-90 transition-all">−</button>
            <span className="font-black text-lg">{qty}</span>
            <button onClick={(e) => { e.stopPropagation(); onInc(); }} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-lg active:scale-90 transition-all">+</button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            disabled={out}
            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
