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
  All: "🍴",
  Other: "🍴",
  Drinks: "🥤",
  Pizza: "🍕",
  Salads: "🥗",
  Desserts: "🍰",
  Electronics: "💻",
  Fashion: "👕",
  Home: "🏠",
  Gadgets: "⌚",
  Beauty: "💄"
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
    <div className="animate-fade-up pb-[100px] md:pb-10 max-w-[1200px] mx-auto w-full px-4 md:px-0 bg-[#faf9f6]">
      {/* Restored Hero Banner */}
      <div className="bg-[#111111] mx-0 my-4 rounded-[32px] overflow-hidden relative min-h-[200px] flex items-center p-8">
         <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-green-500/30 text-green-500 rounded-full px-4 py-1.5 text-[10px] font-bold mb-6 uppercase tracking-wider">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Kitchen Open
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
               Craving something <span className="text-[#e8450a]">delicious?</span>
            </h2>
            <p className="text-sm text-gray-400 font-medium">Order fresh, made just for you</p>
         </div>
         <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-6xl">🍴</div>
         </div>
      </div>

      {/* Connection Bar */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-bold text-green-700">Store connected</span>
         </div>
         <span className="text-[10px] font-bold text-green-500 uppercase">Firebase live</span>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl flex items-center px-4 mb-8 focus-within:border-brand transition-colors shadow-sm">
         <span className="text-xl">🔍</span>
         <input 
            type="text" 
            placeholder="Search dishes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-4 bg-transparent outline-none font-bold text-sm"
         />
      </div>

      {/* Horizontal Categories */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-8">
         {categories.map(cat => (
            <button 
               key={cat}
               onClick={() => setCurCat(cat)}
               className={`flex flex-col items-center justify-center min-w-[80px] p-4 rounded-3xl border transition-all ${curCat === cat ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
            >
               <span className="text-2xl mb-2">{categoryIcons[cat] || "🍱"}</span>
               <span className="text-[10px] font-black uppercase tracking-wider">{cat}</span>
            </button>
         ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
         <span className="text-2xl">🔥</span>
         <h3 className="text-2xl font-black">{curCat === "All" ? "All Items" : curCat}</h3>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </div>
  );
}
