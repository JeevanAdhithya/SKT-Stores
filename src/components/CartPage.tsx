import { useMemo, useState, useEffect } from "react";
import type { CartItem, DeliveryAddress, Product, UserProfile, StoreSettings } from "@/lib/types";
import { getStoreSettings } from "@/lib/settings";
import { Check, CreditCard, Wallet, Copy, QrCode, ArrowLeft } from "lucide-react";
import { showToast } from "./Toast";

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
    paymentMethod: "cod" | "online";
    transactionId?: string;
  }) => Promise<void>;
  onBrowse: () => void;
};

export function CartPage({
  cart, products, profile, onInc, onDec, onRemove, onClear, onPlace, onBrowse,
}: Props) {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [transactionId, setTransactionId] = useState("");
  const [settings, setSettings] = useState<StoreSettings>({ upi_id: "", qr_url: "" });
  
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address || "");
  const [city, setCity] = useState(profile.city || "");
  const [pincode, setPincode] = useState(profile.pincode || "");
  const [landmark, setLandmark] = useState("");
  const [saveDefault, setSaveDefault] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const items = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        return p && qty > 0 ? { p, qty } : null;
      })
      .filter((x): x is { p: Product; qty: number } => !!x);
  }, [cart, products]);

  if (items.length === 0) {
    return (
      <div className="animate-fade-up pb-[100px] md:pb-10">
        <div className="text-center px-7 py-20">
          <span className="block text-[68px] mb-3.5">🛒</span>
          <h3 className="text-[22px] font-extrabold mb-2 text-foreground">Cart is empty</h3>
          <p className="text-muted-text text-sm mb-5">Browse our collection and add items to your cart</p>
          <button onClick={onBrowse}
            className="bg-brand hover:bg-brand-hover text-white rounded-2xl px-8 py-3 font-extrabold text-[15px] transition-all active:scale-95 shadow-lg shadow-brand/20">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  const sub = items.reduce((s, { p, qty }) => s + p.price * qty, 0);
  const tax = Math.round(sub * 0.05);
  const del = sub >= 400 ? 0 : 49;
  const total = sub + tax + del;

  const handleNext = () => {
    setErr("");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10)
      return setErr("Please enter a valid phone number");
    if (!address.trim()) return setErr("Delivery address is required");
    if (!city.trim()) return setErr("City is required");
    if (pincode.replace(/\D/g, "").length !== 6) return setErr("Pincode must be 6 digits");

    if (paymentMethod === "online") {
      setStep('payment');
    } else {
      place();
    }
  };

  const place = async () => {
    if (paymentMethod === "online" && !transactionId.trim()) {
      return setErr("Transaction ID is required for online payment");
    }

    setPlacing(true);
    const cartItems: CartItem[] = items.map(({ p, qty }) => ({
      id: p.id, name: p.name, emoji: p.emoji || "📦",
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
        paymentMethod,
        transactionId: paymentMethod === "online" ? transactionId.trim() : undefined,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(settings.upi_id);
    showToast("UPI ID copied!", "green");
  };

  return (
    <div className="animate-fade-up pb-[100px] md:pb-10 w-full px-6 md:px-10">
      {step === 'details' ? (
        <>
          <div className="py-6 mb-1">
            {/* Back Button */}
            <button
              onClick={onBrowse}
              className="group flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-brand/30 transition-all active:scale-95 mb-6"
            >
              <ArrowLeft size={18} className="text-brand group-hover:-translate-x-1 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-brand">Continue Shopping</span>
            </button>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-foreground">Checkout Details</h2>
              <button onClick={onClear} className="text-muted-text text-sm hover:text-brand transition-colors">
                Clear Cart
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7 lg:col-span-8 space-y-6">
              {/* Items Summary */}
              <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm">
                <h3 className="text-lg font-black mb-4">Items in Cart</h3>
                <div className="space-y-4">
                  {items.map(({ p, qty }) => (
                    <div key={p.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center text-3xl border border-line overflow-hidden">
                        {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <span>{p.emoji || "📦"}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-xs text-brand font-black">₹{p.price} × {qty}</div>
                      </div>
                      <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-xl">
                        <button onClick={() => onDec(p.id)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-lg shadow-sm">−</button>
                        <span className="w-6 text-center font-black text-sm">{qty}</span>
                        <button onClick={() => onInc(p.id, p.stock)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-lg shadow-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Form */}
              <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm">
                <h3 className="text-lg font-black mb-4">📍 Delivery Address</h3>
                <div className="space-y-4">
                  <Field label="Phone Number">
                    <input type="tel" value={phone} placeholder="Your mobile number" onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                  <Field label="Full Address">
                    <input type="text" value={address} placeholder="Flat no, Street, Area" onChange={(e) => setAddress(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <input type="text" value={city} placeholder="City" onChange={(e) => setCity(e.target.value)} />
                    </Field>
                    <Field label="Pincode">
                      <input type="text" value={pincode} maxLength={6} placeholder="6-digit"
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm">
                <h3 className="text-lg font-black mb-4">💳 Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex flex-col items-center gap-2 p-6 rounded-[24px] border-2 transition-all ${paymentMethod === "cod" ? "border-brand bg-brand/5 shadow-md" : "border-line bg-surface-muted"}`}
                  >
                    <Wallet className={paymentMethod === "cod" ? "text-brand" : "text-gray-400"} />
                    <span className={`font-black text-sm ${paymentMethod === "cod" ? "text-brand" : "text-gray-500"}`}>Cash on Delivery</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("online")}
                    className={`flex flex-col items-center gap-2 p-6 rounded-[24px] border-2 transition-all ${paymentMethod === "online" ? "border-brand bg-brand/5 shadow-md" : "border-line bg-surface-muted"}`}
                  >
                    <CreditCard className={paymentMethod === "online" ? "text-brand" : "text-gray-400"} />
                    <span className={`font-black text-sm ${paymentMethod === "online" ? "text-brand" : "text-gray-500"}`}>Online Payment</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="md:col-span-5 lg:col-span-4">
              <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-black mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <BillRow label="Subtotal" value={`₹${sub}`} />
                  <BillRow label="GST (5%)" value={`₹${tax}`} />
                  <BillRow label="Delivery" value={del === 0 ? <span className="text-green-600 font-black">FREE</span> : `₹${del}`} />
                  <div className="border-t border-line pt-3 flex justify-between items-center">
                    <span className="font-black text-lg">Total Amount</span>
                    <span className="font-black text-2xl text-brand">₹{total}</span>
                  </div>
                </div>

                {err && <div className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{err}</div>}

                <button 
                  onClick={handleNext}
                  disabled={placing}
                  className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {paymentMethod === "online" ? "Pay and Place Order" : "Place Order (COD)"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Payment Review Step */
        <div className="max-w-md mx-auto py-12 animate-fade-up">
          <button onClick={() => setStep('details')} className="flex items-center gap-2 text-muted-text hover:text-brand font-bold mb-8">
            <ArrowLeft size={18} /> Back to details
          </button>

          <div className="bg-white rounded-[40px] border border-line p-8 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode size={40} />
            </div>
            
            <div>
              <h2 className="text-2xl font-black">Complete Payment</h2>
              <p className="text-muted-text text-sm mt-1">Scan QR or use UPI ID to pay ₹{total}</p>
            </div>

            <div className="bg-surface-muted p-4 rounded-3xl border-2 border-dashed border-line">
              {settings.qr_url ? (
                <img src={settings.qr_url} alt="Payment QR" className="w-full aspect-square object-contain rounded-xl mb-4" />
              ) : (
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold mb-4">QR Code Not Set</div>
              )}
              
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-line">
                <span className="font-mono text-sm font-black truncate flex-1 text-left">{settings.upi_id}</span>
                <button onClick={copyUpi} className="p-2 hover:bg-brand/10 text-brand rounded-lg"><Copy size={16} /></button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Transaction ID / UTR</label>
                <input 
                  placeholder="Enter 12-digit transaction ID" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)} 
                  className="w-full bg-surface-muted p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none"
                />
              </div>

              {err && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center">{err}</div>}

              <button 
                onClick={place}
                disabled={placing}
                className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-[24px] font-black text-xl shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {placing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="[&_input]:w-full [&_input]:bg-surface-muted [&_input]:p-4 [&_input]:rounded-2xl [&_input]:font-bold [&_input]:border-0 [&_input]:outline-none [&_input:focus]:ring-2 [&_input:focus]:ring-brand [&_textarea]:w-full [&_textarea]:bg-surface-muted [&_textarea]:p-4 [&_textarea]:rounded-2xl [&_textarea]:font-bold [&_textarea]:border-0 [&_textarea]:outline-none [&_textarea:focus]:ring-2 [&_textarea:focus]:ring-brand">
        {children}
      </div>
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between items-center text-sm"><span className="text-muted-text font-bold">{label}</span><span className="font-black">{value}</span></div>;
}
