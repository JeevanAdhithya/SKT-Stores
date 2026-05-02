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
  const isAdmin = email === "sktstores37@gmail.com";
  const displayName = name ? name.toUpperCase() : "PROFILE";

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-gray-100 w-full shadow-sm">
      <div className="flex items-center justify-between w-full px-6 md:px-10 py-4">

        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-12">
          <button
            onClick={() => onChange("shop")}
            className="text-2xl md:text-3xl font-black text-[#e8450a] tracking-tighter flex-shrink-0"
          >
            SKT Stores
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavBtn label="HOME"    active={active === "shop"}    onClick={() => onChange("shop")} />
            <NavBtn label="ORDERS"  active={active === "orders"}  onClick={() => onChange("orders")} />
            <NavBtn label="CART"    active={active === "cart"}    onClick={() => onChange("cart")} badge={cartCount} />
            <NavBtn label="PROFILE" active={active === "profile"} onClick={() => onChange("profile")} />
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Profile chip */}
          <button
            onClick={() => onChange("profile")}
            className={`hidden md:flex items-center gap-3 rounded-full px-4 py-2.5 border transition-all shadow-sm ${
              active === "profile"
                ? "bg-brand border-brand text-white"
                : "bg-[#f4f7f9] border-[#e4e9ed] hover:bg-gray-100"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-inner ${
              active === "profile" ? "bg-white text-brand" : "bg-brand text-white"
            }`}>
              {displayName.charAt(0)}
            </div>
            <span className={`text-[11px] font-black tracking-[0.2em] ${active === "profile" ? "text-white" : "text-gray-900"}`}>
              {displayName}
            </span>
          </button>

          {/* Mobile: Cart + Profile icons */}
          <button
            onClick={() => onChange("cart")}
            className="relative md:hidden bg-brand text-white rounded-full w-11 h-11 flex items-center justify-center shadow-xl shadow-brand/30"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-brand rounded-full w-5 h-5 text-[9px] font-black flex items-center justify-center border-2 border-brand">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChange("profile")}
            className="md:hidden w-11 h-11 bg-brand rounded-full flex items-center justify-center text-[13px] font-black text-white shadow-lg shadow-brand/20"
          >
            {displayName.charAt(0)}
          </button>

          {isAdmin && (
            <Link to="/admin" className="p-2.5 bg-[#f4f7f9] border border-[#e4e9ed] rounded-full hover:bg-gray-100 transition-all shadow-sm text-lg">
              ⚙️
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavBtn({ label, active, onClick, badge }: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-[12px] font-black tracking-[0.15em] pb-1 transition-all ${
        active ? "text-brand" : "text-gray-400 hover:text-gray-800"
      }`}
    >
      {label}
      {badge != null && badge > 0 && (
        <span className="absolute -top-3 -right-5 bg-brand text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          {badge}
        </span>
      )}
      {active && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full" />}
    </button>
  );
}
