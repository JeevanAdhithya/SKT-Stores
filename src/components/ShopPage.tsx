import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onInc: (id: string, max: number) => void;
  onDec: (id: string) => void;
  onProductClick: (id: string) => void;
};

const categoryIcons: Record<string, string> = {
  All: "🛍️",
  Other: "📦",
  Electronics: "💻",
  Fashion: "👕",
  Home: "🏠",
  Gadgets: "⌚",
  Beauty: "💄",
  Accessories: "👜",
  Footwear: "👟",
};

export function ShopPage({ products, cart, onAdd, onInc, onDec, onProductClick }: Props) {
  const [curCat, setCurCat] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const visible = useMemo(() => {
    let list = products;
    if (curCat !== "All") list = list.filter((p) => p.category === curCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, curCat, search]);

  return (
    <div className="animate-fade-up pb-[80px] md:pb-10 w-full px-4 md:px-10">

      {/* Hero Banner — compact, deep navy */}
      <div
        className="mx-0 my-4 rounded-[24px] overflow-hidden relative min-h-[140px] flex items-center px-6 py-5 md:px-10 md:py-7 shadow-lg"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)" }}
      >
        <div className="flex-1 z-10">
          <div className="inline-flex items-center gap-1.5 bg-brand/20 border border-brand/40 text-brand rounded-full px-2.5 py-0.5 text-[9px] font-black mb-3 uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
            New Collection Live
          </div>
          <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-1 tracking-tighter">
            Premium <span className="text-brand">Shopping</span> Destination
          </h2>
          <p className="text-xs text-slate-400 font-bold max-w-sm">
            Exclusive products curated just for you.
          </p>
        </div>
        <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl border border-white/10">🛍️</div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/5 to-transparent"></div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#e4e9ed] rounded-2xl p-1.5 mb-4 shadow-sm flex items-center gap-2 max-w-2xl mx-auto">
        <div className="flex items-center flex-1 bg-[#f4f7f9] rounded-xl px-4">
          <span className="text-base">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 py-3 px-3 bg-transparent outline-none font-bold text-sm text-gray-800 placeholder:text-gray-300"
          />
        </div>
        <button className="bg-brand text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hidden md:block hover:opacity-90 transition-opacity">
          Search
        </button>
      </div>

      {/* Category Pills — compact */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCurCat(cat)}
            className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-full border-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-200 hover:scale-105 active:scale-95 ${
              curCat === cat
                ? "bg-brand border-brand text-white shadow-md shadow-brand/25"
                : "bg-white border-[#e4e9ed] text-gray-500 hover:border-gray-300 hover:text-gray-800"
            }`}
          >
            <span className="text-sm leading-none">{categoryIcons[cat] || "📦"}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black tracking-tight text-gray-900">
          {curCat === "All" ? "All Products" : curCat}
        </h3>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-[#f4f7f9] border border-[#e4e9ed] px-4 py-1.5 rounded-full">
          {visible.length} Items
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {visible.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            qty={cart[p.id] || 0}
            onAdd={() => onAdd(p.id)}
            onInc={() => onInc(p.id, p.stock)}
            onDec={() => onDec(p.id)}
            onClick={() => onProductClick(p.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-400 font-bold">Try a different category or search term</p>
        </div>
      )}
    </div>
  );
}
