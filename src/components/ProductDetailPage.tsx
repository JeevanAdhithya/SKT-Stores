import { Product, UserProfile } from "@/lib/types";
import { ArrowLeft, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw, ChevronLeft } from "lucide-react";
import { useState } from "react";

type Props = {
  product: Product;
  qtyInCart: number;
  onAdd: (id: string) => void;
  onInc: (id: string, max: number) => void;
  onDec: (id: string) => void;
  onBack: () => void;
  onBuyNow: (id: string) => void;
};

export function ProductDetailPage({ product, qtyInCart, onAdd, onInc, onDec, onBack, onBuyNow }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="animate-fade-up pb-24 w-full">
      {/* Back Button Container - Always Visible & Full Width */}
      <div className="px-6 md:px-10 py-6">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:border-brand/30 transition-all active:scale-95"
        >
          <ChevronLeft size={16} className="text-brand group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-brand">Back to Products</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 px-6 md:px-10 py-4">
        {/* Left: Image Section */}
        <div className="space-y-6">
          <div className="aspect-[4/3] lg:aspect-square bg-white rounded-[32px] border border-[#f4f7f9] shadow-md flex items-center justify-center overflow-hidden group relative max-w-lg mx-auto w-full">
            {product.img && !imgError ? (
              <img 
                src={product.img} 
                alt={product.name} 
                className="w-full h-full object-contain p-6 md:p-10 group-hover:scale-105 transition-transform duration-700" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-[100px] drop-shadow-xl">{product.emoji || "📦"}</span>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Badge icon={<ShieldCheck className="text-brand" size={24} />} title="GENUINE" label="Product" />
             <Badge icon={<Truck className="text-brand" size={24} />} title="FAST" label="Delivery" />
             <Badge icon={<RefreshCw className="text-brand" size={24} />} title="7-DAY" label="Return" />
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="flex flex-col py-4">
          <div className="mb-4">
            <span className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-brand/20">
              {product.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-none text-gray-900">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 md:gap-5 mb-8 flex-wrap">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Our Price</span>
               <span className="text-3xl md:text-4xl font-black text-brand tracking-tighter">₹{product.price}</span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <>
                <div className="flex flex-col opacity-40">
                   <span className="text-[9px] font-black uppercase tracking-widest mb-0.5">M.R.P</span>
                   <span className="text-lg font-bold line-through">₹{product.original_price}</span>
                </div>
                <div className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md shadow-green-500/20">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </div>
              </>
            )}
          </div>

          <div className="space-y-5 md:space-y-6 mb-8">
            {/* Description & Brand */}
            <div className="bg-[#f4f7f9] p-5 md:p-6 rounded-3xl border border-[#e4e9ed]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Product Description</h3>
                {product.brand && (
                  <span className="bg-white border border-gray-100 text-gray-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">{product.brand}</span>
                )}
              </div>
              <p className="text-gray-600 font-bold leading-relaxed text-xs md:text-sm">
                {product.description || `Experience premium quality with our ${product.name}. Carefully sourced and rigorously tested to ensure the best performance.`}
              </p>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && product.highlights.some(h => h.trim()) && (
              <div className="space-y-2 px-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Key Highlights</h3>
                <ul className="space-y-1.5">
                  {product.highlights.filter(h => h.trim()).map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm font-bold text-gray-700">
                      <span className="text-brand font-black mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white border border-gray-100 w-fit px-4 py-2 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-4">
            <div className="flex gap-4">
              {qtyInCart > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-[#f4f7f9] rounded-2xl border border-[#e4e9ed] p-1.5 h-[56px]">
                  <button onClick={() => onDec(product.id)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-2xl hover:bg-brand hover:text-white transition-all active:scale-90">-</button>
                  <span className="font-black text-xl tracking-tighter">{qtyInCart}</span>
                  <button onClick={() => onInc(product.id, product.stock)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-2xl hover:bg-brand hover:text-white transition-all active:scale-90">+</button>
                </div>
              ) : (
                <button 
                  onClick={() => onAdd(product.id)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-white border-2 border-brand text-brand h-[56px] rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-brand hover:text-white shadow-lg shadow-brand/5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              )}
            </div>
            
            <button 
              onClick={() => onBuyNow(product.id)}
              disabled={product.stock <= 0}
              className="w-full bg-brand hover:bg-brand-hover text-white h-[56px] rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 tracking-tight"
            >
              <Zap size={26} fill="white" /> Buy It Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, title, label }: { icon: React.ReactNode, title: string, label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#f4f7f9] shadow-sm hover:shadow-md transition-all">
      <div className="w-10 h-10 bg-[#f4f7f9] rounded-xl flex items-center justify-center">
        <div className="scale-75">{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-brand uppercase tracking-widest leading-none mb-1">{title}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">{label}</span>
      </div>
    </div>
  );
}
