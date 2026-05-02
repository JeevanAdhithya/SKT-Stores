import { Link } from "@tanstack/react-router";
import { Home, ShoppingBag, Package, User, ShoppingCart } from "lucide-react";

type Tab = "shop" | "cart" | "orders" | "profile";

type Props = {
  active: Tab;
  cartCount: number;
  name: string;
  email?: string;
  onChange: (t: Tab) => void;
};

const navItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
  { tab: "shop",    label: "Home",    icon: <Home    size={14} strokeWidth={2.5} /> },
  { tab: "orders",  label: "Orders",  icon: <Package size={14} strokeWidth={2.5} /> },
  { tab: "cart",    label: "Cart",    icon: <ShoppingCart size={14} strokeWidth={2.5} /> },
  { tab: "profile", label: "Profile", icon: <User    size={14} strokeWidth={2.5} /> },
];

export function TopNav({ active, cartCount, name, email, onChange }: Props) {
  const isAdmin = email === "sktstores37@gmail.com";
  const displayName = name ? name.toUpperCase() : "PROFILE";

  return (
    <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-gray-100 w-full shadow-md">
      <div className="flex items-center w-full px-6 md:px-12 py-4 gap-6">

        {/* Logo — left */}
        <button
          onClick={() => onChange("shop")}
          className="text-xl md:text-2xl font-black text-[#e8450a] tracking-tight flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          SKT Stores
        </button>

        {/* Nav — center (takes all available space) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {navItems.map(({ tab, label, icon }) => (
            <NavBtn
              key={tab}
              label={label}
              icon={icon}
              active={active === tab}
              badge={tab === "cart" ? cartCount : 0}
              onClick={() => onChange(tab)}
            />
          ))}
        </nav>

        {/* Right side — profile chip + cart icon */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-0">

          {/* Profile chip */}
          <button
            onClick={() => onChange("profile")}
            className={`flex items-center gap-2.5 rounded-full px-4 py-2 border transition-all duration-200 ${
              active === "profile"
                ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                : "bg-[#f4f7f9] border-[#e4e9ed] hover:bg-gray-100 hover:border-gray-200"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
              active === "profile" ? "bg-white text-brand" : "bg-brand text-white shadow-sm"
            }`}>
              {displayName.charAt(0)}
            </div>
            <span className={`text-[11px] font-bold tracking-wider hidden md:block ${
              active === "profile" ? "text-white" : "text-gray-800"
            }`}>
              {displayName}
            </span>
          </button>

          {/* Cart icon button — after account name */}
          <button
            onClick={() => onChange("cart")}
            className={`relative flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
              active === "cart"
                ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                : "bg-[#f4f7f9] border-[#e4e9ed] text-gray-600 hover:bg-brand hover:border-brand hover:text-white"
            }`}
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center justify-center w-8 h-8 bg-[#f4f7f9] border border-[#e4e9ed] rounded-full hover:bg-gray-100 transition-all text-sm"
            >
              ⚙️
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavBtn({ label, icon, active, onClick, badge }: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-bold tracking-wide transition-all duration-200 group ${
        active
          ? "bg-brand text-white shadow-md shadow-brand/20"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <span className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      <span>{label.toUpperCase()}</span>
      {badge != null && badge > 0 && (
        <span className={`absolute -top-1 -right-1 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white leading-none ${
          active ? "bg-white text-brand" : "bg-brand text-white"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
