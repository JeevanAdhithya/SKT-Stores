import { useMemo, useState } from "react";
import type { CartItem, DeliveryAddress, Product, UserProfile } from "@/lib/types";

type Props = {
  cart: Record<string, number>;
  products: Product[];
  profile: UserProfile;
  onInc: (id: string, max: number) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onPlace: (args: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    delivery: number;
    total: number;
    note: string;
    phone: string;
    deliveryAddress: DeliveryAddress;
    saveAsDefault: boolean;
  }) => Promise<void>;
  onBrowse: () => void;
};

export function CartPage({
  cart, products, profile, onInc, onDec, onRemove, onClear, onPlace, onBrowse,
}: Props) {
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address || "");
  const [city, setCity] = useState(profile.city || "");
  const [pincode, setPincode] = useState(profile.pincode || "");
  const [landmark, setLandmark] = useState("");
  const [saveDefault, setSaveDefault] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  const items = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        return p ? { p, qty } : null;
      })
      .filter((x): x is { p: Product; qty: number } => !!x);
  }, [cart, products]);

  if (items.length === 0) {
    return (
      <div className="animate-fade-up pb-[100px] md:pb-10">
        <div className="text-center px-7 py-20">
          <span className="block text-[68px] mb-3.5">🛒</span>
          <h3 className="text-[22px] font-extrabold mb-2">Cart is empty</h3>
          <p className="text-muted-text text-sm mb-5">Add delicious items from our menu</p>
          <button onClick={onBrowse}
            className="bg-brand hover:bg-brand-hover text-brand-fg rounded-[11px] px-8 py-3 font-extrabold text-[15px] transition-colors">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const sub = items.reduce((s, { p, qty }) => s + p.price * qty, 0);
  const tax = Math.round(sub * 0.05);
  const del = sub >= 400 ? 0 : 49;
  const total = sub + tax + del;

  const place = async () => {
    setErr("");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10)
      return setErr("Please enter a valid phone number");
    if (!address.trim()) return setErr("Delivery address is required");
    if (!city.trim()) return setErr("City is required");
    if (pincode.replace(/\D/g, "").length !== 6) return setErr("Pincode must be 6 digits");

    setPlacing(true);
    const cartItems: CartItem[] = items.map(({ p, qty }) => ({
      id: p.id, name: p.name, emoji: p.emoji || "🍴",
      price: p.price, qty, img: p.img || "",
    }));
    try {
      await onPlace({
        items: cartItems, subtotal: sub, tax, delivery: del, total,
        note, phone: phone.trim(),
        deliveryAddress: {
          address: address.trim(), city: city.trim(),
          pincode: pincode.trim(), landmark: landmark.trim() || undefined,
        },
        saveAsDefault: saveDefault,
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="animate-fade-up pb-[100px] md:pb-10 max-w-[1100px] mx-auto w-full">
      <div className="px-3.5 md:px-0 pt-3.5 flex justify-between items-center mb-1">
        <div className="text-[19px] md:text-2xl font-extrabold">🛒 My Cart</div>
        <button onClick={onClear} className="bg-transparent border-0 text-muted-text text-[13px]">
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-3 md:gap-5">
        {/* Items + delivery */}
        <div className="md:col-span-7 lg:col-span-8">
          <div className="p-3.5 md:px-0 flex flex-col gap-2.5">
            {items.map(({ p, qty }) => (
              <div key={p.id} className="bg-surface rounded-[13px] border-[1.5px] border-line p-3 flex items-center gap-3">
                <div className="w-[52px] h-[52px] rounded-[9px] overflow-hidden flex-shrink-0 bg-surface-muted flex items-center justify-center text-2xl border border-line">
                  {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <span>{p.emoji || "🍴"}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold mb-0.5 truncate">{p.name}</div>
                  <div className="text-xs text-brand font-bold">₹{p.price} × {qty} = ₹{p.price * qty}</div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center bg-surface-muted rounded-[9px] overflow-hidden w-[88px] justify-between">
                    <button onClick={() => onDec(p.id)} className="bg-brand hover:bg-brand-hover text-brand-fg w-[28px] h-[28px] text-base font-extrabold">−</button>
                    <span className="text-sm font-extrabold">{qty}</span>
                    <button onClick={() => onInc(p.id, p.stock)} className="bg-brand hover:bg-brand-hover text-brand-fg w-[28px] h-[28px] text-base font-extrabold">+</button>
                  </div>
                  <button onClick={() => onRemove(p.id)} className="bg-danger-bg text-danger border-0 rounded-[7px] w-[28px] h-[28px] text-sm">🗑</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-[16px] border-[1.5px] border-line mx-3.5 md:mx-0 mb-3 p-4">
            <h3 className="text-[15px] font-extrabold mb-3">📍 Delivery Details</h3>
            <Field label="Phone">
              <input type="tel" value={phone} placeholder="Phone number" onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Address">
              <input type="text" value={address} placeholder="House/flat, street, area" onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="City">
                <input type="text" value={city} placeholder="City" onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="Pincode">
                <input type="text" value={pincode} maxLength={6} placeholder="6-digit pincode"
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} />
              </Field>
            </div>
            <Field label="Landmark (optional)">
              <input type="text" value={landmark} placeholder="Nearby landmark" onChange={(e) => setLandmark(e.target.value)} />
            </Field>
            <Field label="Order notes (optional)">
              <textarea placeholder="Special instructions..." value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 mt-2 text-xs text-muted-text cursor-pointer">
              <input type="checkbox" checked={saveDefault} onChange={(e) => setSaveDefault(e.target.checked)}
                className="w-4 h-4 accent-brand" />
              Save as my default address
            </label>
          </div>
        </div>

        {/* Bill summary */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="md:sticky md:top-24">
            <div className="bg-surface rounded-[16px] border-[1.5px] border-line mx-3.5 md:mx-0 mb-3 p-4">
              <h3 className="text-[15px] font-extrabold mb-3">🧾 Bill Summary</h3>
              <BillRow label="Subtotal" value={`₹${sub}`} />
              <BillRow label="GST (5%)" value={`₹${tax}`} />
              <BillRow label="Delivery" value={del === 0 ? <span className="text-ok font-extrabold">FREE</span> : `₹${del}`} />
              {del > 0 && (
                <div className="text-[11px] text-muted-text -mt-1 mb-2">
                  Add ₹{400 - sub} more for free delivery
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-brand border-t-[1.5px] border-line pt-3 mt-1">
                <span>Total Payable</span><span>₹{total}</span>
              </div>
            </div>

            {err && (
              <div className="bg-danger-bg text-danger text-xs font-semibold rounded-lg border border-danger/25 mx-3.5 md:mx-0 mb-2 px-3 py-2">
                {err}
              </div>
            )}

            <button onClick={place} disabled={placing}
              className="flex items-center justify-center gap-2.5 mx-3.5 md:mx-0 mb-4 w-[calc(100%-1.75rem)] md:w-full text-brand-fg rounded-[13px] py-4 font-black text-[17px] active:scale-[0.97] transition disabled:opacity-60"
              style={{ background: "var(--gradient-brand)", boxShadow: placing ? "none" : "var(--shadow-brand)" }}>
              {placing ? "Sending to kitchen..." : `🛒 Place Order · ₹${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 [&_input]:w-full [&_input]:bg-surface-muted [&_input]:border-[1.5px] [&_input]:border-line [&_input]:rounded-[10px] [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input:focus]:border-brand [&_textarea]:w-full [&_textarea]:bg-surface-muted [&_textarea]:border-[1.5px] [&_textarea]:border-line [&_textarea]:rounded-[10px] [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea]:resize-y [&_textarea]:min-h-[60px] [&_textarea:focus]:border-brand">
      <label className="text-[11px] font-bold text-muted-text block mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between text-sm mb-2.5"><span>{label}</span><span>{value}</span></div>;
}
