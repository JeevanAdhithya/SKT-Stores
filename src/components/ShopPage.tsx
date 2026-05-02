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
    <div className="animate-fade-up pb-[120px] md:pb-16 w-full px-4 md:px-10">

      {/* Hero Banner — premium dark with orange accent */}
      <div className="bg-[#111111] mx-0 my-6 rounded-[40px] overflow-hidden relative min-h-[260px] flex items-center p-8 md:p-16 shadow-2xl">
        <div className="flex-1 z-10">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 text-brand rounded-full px-4 py-1.5 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
            New Collection Live
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tighter">
            Premium <span className="text-brand">Shopping</span> <br /> Destination
          </h2>
          <p className="text-sm md:text-lg text-gray-400 font-bold tracking-wide max-w-lg">
            Discover the latest trends and exclusive premium products curated just for you.
          </p>
        </div>
        <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2">
          <div className="w-56 h-56 bg-brand/10 rounded-full flex items-center justify-center text-[120px] shadow-2xl">🛍️</div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/5 to-transparent"></div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#e4e9ed] rounded-[32px] p-2 mb-10 shadow-sm flex items-center gap-2 max-w-3xl mx-auto">
        <div className="flex items-center flex-1 bg-[#f4f7f9] rounded-[26px] px-6">
          <span className="text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search for electronics, fashion, gadgets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-5 bg-transparent outline-none font-bold text-sm text-gray-800 placeholder:text-gray-300"
          />
        </div>
        <button className="bg-brand text-white px-8 py-5 rounded-[26px] font-black text-xs uppercase tracking-widest hidden md:block hover:opacity-90 transition-opacity">
          Search
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCurCat(cat)}
            className={`flex flex-col items-center justify-center min-w-[110px] p-6 rounded-[32px] border-2 transition-all ${
              curCat === cat
                ? "bg-brand border-brand text-white shadow-xl shadow-brand/30 scale-105"
                : "bg-white border-[#e4e9ed] text-gray-500 hover:border-gray-300 hover:bg-[#f4f7f9]"
            }`}
          >
            <span className="text-4xl mb-3">{categoryIcons[cat] || "📦"}</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{cat}</span>
          </button>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✨</span>
          <h3 className="text-4xl font-black tracking-tighter text-gray-900">
            {curCat === "All" ? "All Products" : curCat}
          </h3>
        </div>
        <div className="text-xs font-black text-gray-500 uppercase tracking-widest bg-[#f4f7f9] border border-[#e4e9ed] px-6 py-3 rounded-full">
          {visible.length} Items
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
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
