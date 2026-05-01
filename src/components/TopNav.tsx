import { Link } from "@tanstack/react-router";
type Tab = "shop" | "cart" | "orders" | "profile";

type Props = {
  active: Tab;
  cartCount: number;
  name: string;
  email?: string; // Add email prop
  onChange: (t: Tab) => void;
};

const links: { id: Tab; label: string }[] = [
  { id: "shop", label: "Menu" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
];

export function TopNav({ active, cartCount, name, email, onChange }: Props) {
  const initial = name.charAt(0).toUpperCase() || "?";
  const first = name.split(" ")[0] || "";
  const isAdmin = email === "sktstores37@gmail.com";

  return (
    <header className="max-md:hidden sticky top-0 z-[100] bg-surface/80 backdrop-blur-xl border-b border-line/50 shadow-sm transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
        <button onClick={() => onChange("shop")} className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-warm hover:scale-105 transition-transform duration-300 drop-shadow-sm">
          SKT Stores
        </button>
        <nav className="flex items-center gap-2 bg-surface-muted/50 p-1 rounded-2xl border border-line/40">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => onChange(l.id)}
              className={`px-5 py-2 rounded-xl text-[14px] font-extrabold transition-all duration-300 ${
                active === l.id
                  ? "bg-white dark:bg-black shadow-[0_2px_10px_rgba(0,0,0,0.08)] text-brand scale-105"
                  : "text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-black/50"
              }`}
            >
              {l.label}
            </button>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-5 py-2 rounded-xl text-[14px] font-extrabold text-brand hover:bg-brand/10 transition-all"
            >
              Admin ⚙️
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onChange("profile")}
            className="group flex items-center gap-2 bg-surface hover:bg-surface-muted rounded-full pl-1.5 pr-4 py-1.5 border border-line/50 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            <div className="w-[32px] h-[32px] bg-gradient-to-br from-brand to-brand-glow rounded-full flex items-center justify-center text-sm font-black text-white shadow-inner group-hover:scale-105 transition-transform">
              {initial}
            </div>
            <span className="text-[14px] font-bold max-w-[120px] truncate group-hover:text-brand transition-colors">{first}</span>
          </button>
          <button
            onClick={() => onChange("cart")}
            className="group relative bg-gradient-to-r from-brand to-brand-glow hover:from-brand-hover hover:to-brand text-white rounded-full pl-5 pr-3 py-2.5 font-extrabold text-[14px] flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_20px_-6px_rgba(232,69,10,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(232,69,10,0.8)]"
          >
            <span className="text-lg group-hover:-rotate-12 transition-transform">🛒</span>
            <span className="bg-white text-brand rounded-full min-w-[24px] h-[24px] text-[12px] font-black flex items-center justify-center px-1.5 shadow-inner">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
