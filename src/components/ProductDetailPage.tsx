import { Product, UserProfile } from "@/lib/types";
import { ArrowLeft, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw } from "lucide-react";
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
    <div className="animate-fade-up max-w-[1200px] mx-auto pb-24">
      {/* Mobile Back Button */}
      <button onClick={onBack} className="md:hidden p-4 text-brand flex items-center gap-2 font-bold">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12 p-4 md:p-10">
        {/* Left: Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-[48px] border border-line shadow-xl flex items-center justify-center overflow-hidden group">
            {product.img && !imgError ? (
              <img 
                src={product.img} 
                alt={product.name} 
                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-[120px]">{product.emoji || "📦"}</span>
            )}
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
             <Badge icon={<ShieldCheck className="text-brand" size={18} />} label="Genuine Product" />
             <Badge icon={<Truck className="text-brand" size={18} />} label="Fast Delivery" />
             <Badge icon={<RefreshCw className="text-brand" size={18} />} label="7-Day Return" />
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand/20">
              {product.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-black text-brand">₹{product.price}</span>
            <span className="text-sm font-bold text-muted-text line-through opacity-50">₹{Math.round(product.price * 1.4)}</span>
            <span className="bg-green-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg">40% OFF</span>
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-surface-muted p-6 rounded-[32px] border border-line">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Product Description</h3>
              <p className="text-gray-600 font-bold leading-relaxed">
                Experience premium quality with our {product.name}. Carefully sourced and rigorously tested to ensure the best performance. {product.tag ? `This item is currently tagged as "${product.tag}".` : ""}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-4">
            <div className="flex gap-4">
              {qtyInCart > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-surface-muted rounded-[24px] border border-line p-1.5 h-[64px]">
                  <button onClick={() => onDec(product.id)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-2xl active:scale-90 transition-all">−</button>
                  <span className="font-black text-xl">{qtyInCart}</span>
                  <button onClick={() => onInc(product.id, product.stock)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-2xl active:scale-90 transition-all">+</button>
                </div>
              ) : (
                <button 
                  onClick={() => onAdd(product.id)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-white border-2 border-brand text-brand h-[64px] rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-brand/5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={22} /> Add to Cart
                </button>
              )}
            </div>
            
            <button 
              onClick={() => onBuyNow(product.id)}
              disabled={product.stock <= 0}
              className="w-full bg-brand hover:bg-brand-hover text-white h-[64px] rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <Zap size={22} fill="white" /> Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl border border-line text-center shadow-sm">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 leading-tight">{label}</span>
    </div>
  );
}
