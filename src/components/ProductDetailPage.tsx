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
          className="group flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:border-brand/30 transition-all active:scale-95"
        >
          <ChevronLeft size={20} className="text-brand group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-brand">Back to Products</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 px-6 md:px-10 py-4">
        {/* Left: Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-[48px] border border-[#f4f7f9] shadow-xl flex items-center justify-center overflow-hidden group relative">
            {product.img && !imgError ? (
              <img 
                src={product.img} 
                alt={product.name} 
                className="w-full h-full object-contain p-8 md:p-16 group-hover:scale-105 transition-transform duration-700" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-[140px] drop-shadow-2xl">{product.emoji || "📦"}</span>
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
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none text-gray-900">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Our Price</span>
               <span className="text-5xl font-black text-brand tracking-tighter">₹{product.price}</span>
            </div>
            <div className="flex flex-col opacity-40">
               <span className="text-[10px] font-black uppercase tracking-widest mb-1">M.R.P</span>
               <span className="text-xl font-bold line-through">₹{Math.round(product.price * 1.4)}</span>
            </div>
            <div className="bg-green-500 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg shadow-green-500/20">
              40% OFF
            </div>
          </div>

          <div className="space-y-8 mb-12">
            <div className="bg-[#f4f7f9] p-8 rounded-[40px] border border-[#e4e9ed]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Product Description</h3>
              <p className="text-gray-600 font-bold leading-relaxed text-sm md:text-base">
                Experience premium quality with our {product.name}. Carefully sourced and rigorously tested to ensure the best performance. {product.tag ? `This exclusive item is currently featured as part of our "${product.tag}" collection.` : "A perfect addition to your curated lifestyle."}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-gray-100 w-fit px-6 py-3 rounded-full shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-5">
            <div className="flex gap-5">
              {qtyInCart > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-[#f4f7f9] rounded-[32px] border border-[#e4e9ed] p-2 h-[80px]">
                  <button onClick={() => onDec(product.id)} className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-3xl hover:bg-brand hover:text-white transition-all active:scale-90">-</button>
                  <span className="font-black text-2xl tracking-tighter">{qtyInCart}</span>
                  <button onClick={() => onInc(product.id, product.stock)} className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-3xl hover:bg-brand hover:text-white transition-all active:scale-90">+</button>
                </div>
              ) : (
                <button 
                  onClick={() => onAdd(product.id)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-white border-2 border-brand text-brand h-[80px] rounded-[32px] font-black text-xl flex items-center justify-center gap-4 hover:bg-brand hover:text-white shadow-xl shadow-brand/5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={26} /> Add to Cart
                </button>
              )}
            </div>
            
            <button 
              onClick={() => onBuyNow(product.id)}
              disabled={product.stock <= 0}
              className="w-full bg-brand hover:bg-brand-hover text-white h-[80px] rounded-[32px] font-black text-2xl flex items-center justify-center gap-4 shadow-2xl shadow-brand/30 active:scale-95 transition-all disabled:opacity-50 tracking-tight"
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
    <div className="flex items-center gap-4 p-6 bg-white rounded-[32px] border border-[#f4f7f9] shadow-sm hover:shadow-md transition-all">
      <div className="w-14 h-14 bg-[#f4f7f9] rounded-2xl flex items-center justify-center">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-brand uppercase tracking-widest leading-none mb-1">{title}</span>
        <span className="text-xs font-black uppercase tracking-widest text-gray-400 leading-none">{label}</span>
      </div>
    </div>
  );
}
