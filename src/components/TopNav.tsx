import { Link } from "@tanstack/react-router";
type Tab = "shop" | "cart" | "orders" | "profile";

type Props = {
  active: Tab;
  cartCount: number;
  name: string;
  email?: string;
  onChange: (t: Tab) => void;
};

export function TopNav({ active, cartCount, name, email, onChange }: Props) {
  const initial = name.charAt(0).toUpperCase() || "?";
  const isAdmin = email === "sktstores37@gmail.com";

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <button onClick={() => onChange("shop")} className="text-2xl font-black text-[#e8450a] flex items-center gap-1">
            ShopEase
          </button>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             <span className="text-[10px] font-bold text-gray-400">Open now</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onChange("profile")}
            className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-all"
          >
            <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center text-[10px] font-black text-white">G</div>
            <span className="text-xs font-black text-brand">{name.toLowerCase()}</span>
          </button>

          <button
            onClick={() => onChange("cart")}
            className="relative bg-brand text-white rounded-full p-2 w-20 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
          >
            <span className="text-lg">🛒</span>
            <span className="bg-white text-brand rounded-full w-6 h-6 text-[11px] font-black flex items-center justify-center">
              {cartCount}
            </span>
          </button>
          
          {isAdmin && (
            <Link to="/admin" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
               ⚙️
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
