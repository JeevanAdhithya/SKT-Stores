import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoryStrip } from "./CategoryStrip";
import type { Product } from "@/lib/types";
import { ShoppingBag, Sparkles } from "lucide-react";

type Props = {
  products: Product[];
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onInc: (id: string, max: number) => void;
  onDec: (id: string) => void;
  onProductClick: (id: string) => void;
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
    <div className="animate-fade-up pb-[100px] md:pb-10 max-w-[1200px] mx-auto w-full px-4 md:px-0">
      {/* Premium Hero */}
      <div className="bg-brand mx-0 my-6 rounded-[40px] overflow-hidden relative shadow-2xl shadow-brand/20 min-h-[220px] flex items-center">
        {/* Abstract shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[80%] h-[150%] rounded-full bg-white/10 blur-[100px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[100%] rounded-full bg-orange-400/20 blur-[100px]"></div>
        </div>

        <div className="w-full p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full px-4 py-2 text-[10px] md:text-xs font-black mb-6 uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" /> Shop the Future
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-4 tracking-tighter">
              Quality Meets <br /> <span className="text-orange-200">Affordability.</span>
            </h2>
            <p className="text-base md:text-xl text-white/80 max-w-lg font-bold">
              Explore thousands of products with express delivery and secure payments.
            </p>
          </div>
          <div className="relative hidden lg:block transform rotate-6 scale-125">
             <ShoppingBag size={180} className="text-white/20" />
          </div>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="relative z-20 -mt-10 mx-auto max-w-[95%] md:max-w-[700px]">
        <div className="flex items-center gap-4 bg-white shadow-2xl shadow-brand/10 border border-line rounded-[24px] px-6 py-1 focus-within:ring-4 focus-within:ring-brand/10 transition-all duration-500">
          <span className="text-2xl text-brand">🔍</span>
          <input
            type="search"
            placeholder="Search for mobiles, clothes, home and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 py-5 text-[16px] font-bold outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-12">
        <CategoryStrip categories={categories} current={curCat} onChange={setCurCat} />
      </div>

      <div className="flex items-center justify-between pb-6 pt-8">
        <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3">
          {curCat === "All" ? "🔥 Trending Now" : `📂 ${curCat}`}
        </h3>
        <div className="h-px flex-1 mx-6 bg-line hidden sm:block"></div>
        <span className="text-xs font-black text-muted-text bg-surface-muted px-4 py-2 rounded-full uppercase tracking-widest border border-line">
          {visible.length} Products
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border border-line shadow-sm">
          <div className="text-8xl mb-6">🏜️</div>
          <p className="font-black text-2xl">Nothing here yet!</p>
          <p className="text-muted-text mt-2 font-bold italic opacity-60">Try searching for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
          {visible.map((p) => (
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
      )}
    </div>
  );
}
