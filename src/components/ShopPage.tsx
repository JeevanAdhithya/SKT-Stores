import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoryStrip } from "./CategoryStrip";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onInc: (id: string, max: number) => void;
  onDec: (id: string) => void;
};

export function ShopPage({ products, cart, onAdd, onInc, onDec }: Props) {
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
    <div className="animate-fade-up pb-[100px] md:pb-10 max-w-[1200px] mx-auto w-full">
      {/* Hero */}
      <div className="bg-ink mx-3.5 md:mx-0 my-3.5 md:my-6 rounded-[28px] overflow-hidden relative shadow-[0_20px_40px_-15px_rgba(232,69,10,0.3)] min-h-[180px] flex items-center">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[120%] rounded-full bg-brand/20 blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[100%] rounded-full bg-brand-warm/20 blur-[80px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="w-full p-6 md:p-12 flex flex-col md:flex-row items-center justify-between relative z-10 backdrop-blur-[2px] bg-white/[0.02]">
          <div className="flex-1 text-center md:text-left mb-6 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-4 py-1.5 text-[10px] md:text-xs font-bold mb-4 shadow-lg uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-blue-400 relative" /> 
              Store Online
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-white leading-tight mb-3 drop-shadow-lg tracking-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Collections</span>
            </h2>
            <p className="text-sm md:text-lg text-white/70 max-w-md font-medium">
              Discover the latest gadgets, fashion, and home essentials at unbeatable prices.
            </p>
          </div>
          <div className="relative group perspective-1000 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-300 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="text-[70px] md:text-[110px] relative z-10 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 drop-shadow-2xl">
              🛍️
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3.5 md:px-0 pb-6 relative z-20 -mt-6 md:-mt-10 mx-auto max-w-[95%] md:max-w-[600px]">
        <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a2e] backdrop-blur-xl border border-line/50 shadow-xl rounded-2xl px-5 py-0.5 focus-within:ring-4 focus-within:ring-brand/20 transition-all duration-300">
          <span className="text-xl text-brand">🔍</span>
          <input
            type="search"
            placeholder="Search products, brands, and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 py-3.5 text-[15px] font-semibold outline-none"
          />
        </div>
      </div>

      <CategoryStrip categories={categories} current={curCat} onChange={setCurCat} />

      <div className="flex items-center justify-between px-3.5 md:px-0 pb-4 pt-2">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
          {curCat === "All" ? (
             <><span className="text-brand">🔥</span> Popular Items</>
          ) : (
            <><span className="text-brand">📂</span> {curCat}</>
          )}
        </h3>
        <span className="text-sm font-semibold text-muted-text bg-surface-muted px-3 py-1 rounded-full">
          {visible.length} items
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-muted-text px-3.5 bg-surface rounded-[24px] border border-line mx-3.5 md:mx-0 shadow-sm">
          <div className="text-6xl mb-4 animate-bounce">😕</div>
          <p className="font-extrabold text-xl">No items found</p>
          <p className="text-sm mt-2 opacity-70">Try searching for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-3.5 md:px-0 pb-6">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              qty={cart[p.id] || 0}
              onAdd={() => onAdd(p.id)}
              onInc={() => onInc(p.id, p.stock)}
              onDec={() => onDec(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
