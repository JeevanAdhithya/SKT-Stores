import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/components/Toast";
import { Plus, Package, ShoppingBag, Trash2, Edit2, X, Upload, Link as LinkIcon, CheckCircle, XCircle, Settings, QrCode, CreditCard } from "lucide-react";
import { getStoreSettings, updateStoreSettings } from "@/lib/settings";

const ADMIN_EMAIL = 'sktstores37@gmail.com';

export function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [storeSettings, setStoreSettings] = useState({ upi_id: '', qr_url: '' });
  
  const [formData, setFormData] = useState({
    id: '', name: '', category: 'Electronics', price: 0, stock: 0, 
    emoji: '📦', tag: '', img: ''
  });

  useEffect(() => {
    fetchData();
    getStoreSettings().then(setStoreSettings);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (p) setProducts(p);
    if (o) setOrders(o);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
    
    let error;
    if (editingId) {
      const { error: err } = await supabase.from('products').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('products').insert([payload]);
      error = err;
    }

    if (error) {
      showToast("Error: " + error.message, "red");
    } else {
      showToast(editingId ? "Updated!" : "Created!", "green");
      setModalOpen(false);
      fetchData();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'qr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${target === 'product' ? 'products' : 'settings'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      showToast("Upload failed: " + uploadError.message, "red");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (target === 'product') {
      setFormData({ ...formData, img: publicUrl });
    } else {
      setStoreSettings({ ...storeSettings, qr_url: publicUrl });
      await updateStoreSettings({ qr_url: publicUrl });
    }
    showToast("Image uploaded!", "green");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) showToast(error.message, "red");
    else {
      showToast(`Order marked as ${status}`, "green");
      fetchData();
    }
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setImageType(p.img?.startsWith('http') ? 'url' : 'upload');
    setModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Enhanced Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-black text-brand">SKT Admin</h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Flipkart Style Portal</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Inventory" />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={20} />} label="Orders" badge={orders.filter(o => o.status === 'pending').length} />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Store Settings" />
          <div className="mt-4 pt-4 border-t border-gray-50">
            <button 
              onClick={() => { setEditingId(null); setFormData({id:'', name:'', category:'Electronics', price:0, stock:0, emoji:'📦', tag:'', img:''}); setModalOpen(true); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-brand text-white shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'inventory' && (
          <div className="animate-fade-up">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black">Catalog Management</h1>
                <p className="text-gray-500">Manage products, stock and visibility</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-xs font-bold text-gray-400 uppercase tracking-wider">
                {products.length} Total Products
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="relative aspect-square rounded-[24px] bg-gray-50 overflow-hidden mb-4 flex items-center justify-center">
                    {p.img ? (
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-6xl">{p.emoji}</span>
                    )}
                    {p.tag && <span className="absolute top-4 left-4 bg-brand text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{p.tag}</span>}
                  </div>
                  <h3 className="text-lg font-black mb-1">{p.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-brand">₹{p.price}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Edit2 size={18} /></button>
                      <button onClick={async () => { if(confirm("Delete?")) await supabase.from('products').delete().eq('id', p.id); fetchData(); }} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className={`mt-3 text-[10px] font-black uppercase tracking-widest ${p.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-fade-up">
            <header className="mb-8">
              <h1 className="text-3xl font-black">Order Requests</h1>
              <p className="text-gray-500">Track and fulfill customer orders</p>
            </header>
            
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-gray-400">#{o.id.slice(0,8)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <h3 className="text-xl font-black">{o.customer_name}</h3>
                      <p className="text-sm text-gray-500">{o.customer_phone} · {o.payment_method?.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-brand">₹{o.total_amount}</div>
                      <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 mb-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Items</div>
                    <div className="space-y-2">
                      {o.items.map((it: any, i: number) => (
                        <div key={i} className="text-sm font-bold flex justify-between">
                          <span>{it.name} × {it.qty}</span>
                          <span>₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {o.payment_method === 'online' && (
                    <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[10px] font-black text-brand uppercase tracking-widest">Transaction ID / UTR</div>
                        <div className="text-[10px] font-black text-brand uppercase tracking-widest">Verified Payment Required</div>
                      </div>
                      <div className="font-mono font-black text-brand text-lg">{o.transaction_id || 'NOT PROVIDED'}</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {o.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(o.id, 'confirmed')} className="bg-brand text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 transition-all hover:scale-105">Confirm Order</button>
                        <button onClick={() => updateStatus(o.id, 'cancelled')} className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 transition-all">Cancel</button>
                      </>
                    )}
                    {o.status === 'confirmed' && (
                      <button onClick={() => updateStatus(o.id, 'delivered')} className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all hover:scale-105">Mark as Delivered</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-up max-w-2xl">
            <header className="mb-8">
              <h1 className="text-3xl font-black">Store Settings</h1>
              <p className="text-gray-500">Configure payments and store-wide details</p>
            </header>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <CreditCard size={20} className="text-brand" /> Payment Details
                </h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant UPI ID</label>
                  <input 
                    placeholder="yourname@upi" 
                    value={storeSettings.upi_id} 
                    onChange={e => setStoreSettings({...storeSettings, upi_id: e.target.value})} 
                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment QR Code</label>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">
                      {storeSettings.qr_url ? (
                        <img src={storeSettings.qr_url} className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="text-gray-300" size={32} />
                      )}
                    </div>
                    <label className="bg-white border border-line px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 cursor-pointer transition-all">
                      Upload QR
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'qr')} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => { await updateStoreSettings(storeSettings); showToast("Settings saved!", "green"); }}
                className="w-full bg-brand text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-brand/30 transition-all active:scale-95"
              >
                Save Store Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique ID</label>
                  <input placeholder="e.g. phone-01" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required disabled={!!editingId} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emoji Icon</label>
                  <input placeholder="📦" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                <input placeholder="Name of your product" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 border-b border-gray-100 pb-2">
                  <button type="button" onClick={() => setImageType('url')} className={`text-xs font-black uppercase tracking-widest pb-2 px-2 transition-all ${imageType === 'url' ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>Image URL</button>
                  <button type="button" onClick={() => setImageType('upload')} className={`text-xs font-black uppercase tracking-widest pb-2 px-2 transition-all ${imageType === 'upload' ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>Upload File</button>
                </div>
                
                {imageType === 'url' ? (
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input placeholder="https://image.url/photo.jpg" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full bg-gray-50 p-4 pl-12 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-brand hover:bg-brand/5 cursor-pointer transition-all">
                    <Upload className="text-gray-400 mb-2" />
                    <span className="text-sm font-bold text-gray-500">Click to upload image</span>
                    <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'product')} accept="image/*" />
                    {formData.img && <span className="mt-2 text-[10px] text-green-600 font-bold">✓ Ready</span>}
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                  <input type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none">
                    <option>Electronics</option><option>Fashion</option><option>Home</option><option>Gadgets</option><option>Beauty</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tag (Sale, New)</label>
                  <input placeholder="e.g. 20% OFF" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-brand outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-brand/30 transition-all active:scale-95">
                {editingId ? 'Update Product' : 'Add to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all relative ${active ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-500 hover:bg-gray-50'}`}
    >
      {icon}
      <span>{label}</span>
      {badge ? <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{badge}</span> : null}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    delivered: 'bg-green-100 text-green-700'
  };
  return <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
}
