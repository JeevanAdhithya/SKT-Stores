import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/components/Toast";
import { Plus, Package, ShoppingBag, Trash2, Edit2, X, Upload, Link as LinkIcon, CheckCircle, XCircle, Settings, QrCode, CreditCard, User, Phone, MapPin, Receipt, FileText, ChevronRight } from "lucide-react";
import { getStoreSettings, updateStoreSettings } from "@/lib/settings";

const ADMIN_EMAIL = 'sktstores37@gmail.com';

export function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
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

    showToast("Uploading image...", "blue");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${target === 'product' ? 'products' : 'settings'}/${fileName}`;

    try {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File too large (max 5MB)", "red");
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      if (target === 'product') {
        setFormData(prev => ({ ...prev, img: publicUrl }));
      } else {
        setStoreSettings(prev => ({ ...prev, qr_url: publicUrl }));
        await updateStoreSettings({ qr_url: publicUrl });
      }
      showToast("Image uploaded successfully!", "green");
    } catch (error: any) {
      showToast("Upload failed: " + (error.message || "Please try again"), "red");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) showToast(error.message, "red");
    else {
      showToast(`Order marked as ${status}`, "green");
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev: any) => ({ ...prev, status }));
      }
      fetchData();
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setImageType(p.img?.startsWith('http') ? 'url' : 'upload');
    setModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans text-gray-900">
      {/* Enhanced Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col gap-8 sticky top-0 h-screen">
        <div>
          <h2 className="text-2xl font-black text-brand tracking-tighter">SKT Admin</h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">E-Commerce Management</p>
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
                <h1 className="text-3xl font-black tracking-tight">Catalog Management</h1>
                <p className="text-gray-500 font-medium">Manage products, stock and visibility</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-xs font-black text-gray-400 uppercase tracking-widest">
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
              <h1 className="text-3xl font-black tracking-tight">Order Requests</h1>
              <p className="text-gray-500 font-medium">Track and fulfill customer orders</p>
            </header>
            
            <div className="grid grid-cols-1 gap-4">
              {orders.map(o => (
                <button 
                  key={o.id} 
                  onClick={() => openOrderDetails(o)}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#f4f7f9] rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-brand/5 transition-colors">
                      {o.status === 'pending' ? '⏳' : o.status === 'confirmed' ? '✅' : o.status === 'delivered' ? '📦' : '❌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-[10px] font-black text-gray-300 uppercase tracking-widest">#{o.id.slice(-8).toUpperCase()}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{o.customer_name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()} · {o.payment_method?.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:block">
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Items</div>
                      <div className="text-xs font-black">{o.items.length} Product{o.items.length > 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Amount</div>
                      <div className="text-xl font-black text-brand">₹{o.total}</div>
                    </div>
                    <ChevronRight size={24} className="text-gray-200 group-hover:text-brand transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-up max-w-2xl">
            <header className="mb-8">
              <h1 className="text-3xl font-black tracking-tight">Store Settings</h1>
              <p className="text-gray-500 font-medium">Configure payments and store-wide details</p>
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

      {/* Order Details Modal */}
      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#f4f7f9]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs font-black text-gray-400">ORDER #{selectedOrder.id.toUpperCase()}</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">{new Date(selectedOrder.created_at).toLocaleString()}</h2>
              </div>
              <button onClick={() => setOrderModalOpen(false)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"><X /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Customer Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-brand" /> Customer Details
                  </h3>
                  <div className="bg-[#f4f7f9] p-5 rounded-3xl space-y-3">
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Name</div>
                      <div className="text-sm font-black uppercase">{selectedOrder.customer_name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-gray-300" />
                      <div className="text-sm font-bold">{selectedOrder.customer_phone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-brand" /> Delivery Address
                  </h3>
                  <div className="bg-[#f4f7f9] p-5 rounded-3xl">
                    <div className="text-sm font-bold leading-relaxed">
                      {selectedOrder.delivery_address?.address},<br />
                      {selectedOrder.delivery_address?.city} - {selectedOrder.delivery_address?.pincode}<br />
                      <span className="text-xs text-gray-400 font-medium italic mt-2 block">Landmark: {selectedOrder.delivery_address?.landmark || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag size={14} className="text-brand" /> Order Items
                </h3>
                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.map((it: any, i: number) => (
                        <tr key={i} className="text-sm font-bold">
                          <td className="px-6 py-4">{it.emoji || '🛍️'} {it.name}</td>
                          <td className="px-6 py-4 text-center">×{it.qty}</td>
                          <td className="px-6 py-4 text-right">₹{it.price || 0}</td>
                          <td className="px-6 py-4 text-right">₹{(it.price || 0) * it.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} className="text-brand" /> Payment Info
                  </h3>
                  <div className="bg-[#f4f7f9] p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-black uppercase text-brand tracking-widest">{selectedOrder.payment_method}</span>
                    </div>
                    {selectedOrder.payment_method === 'online' && (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Transaction ID / UTR</span>
                        <div className="font-mono font-black text-blue-600 bg-white p-3 rounded-xl border border-blue-100 break-all">
                          {selectedOrder.transaction_id || 'NOT PROVIDED'}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedOrder.note && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-brand" /> Customer Note
                      </h3>
                      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl text-xs font-bold text-yellow-700 italic">
                        "{selectedOrder.note}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Receipt size={14} className="text-brand" /> Order Summary
                  </h3>
                  <div className="bg-gray-900 text-white p-6 rounded-[32px] space-y-4 shadow-xl">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>GST (5%)</span>
                      <span>₹{selectedOrder.tax || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Delivery</span>
                      <span className="text-green-400 font-black uppercase tracking-widest">{selectedOrder.delivery > 0 ? `₹${selectedOrder.delivery}` : 'Free'}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Amount</span>
                      <span className="text-3xl font-black text-brand tracking-tighter">₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-8 border-t border-gray-100 flex gap-4">
              {selectedOrder.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(selectedOrder.id, 'confirmed')} className="flex-1 bg-brand text-white py-4 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95">Confirm Order</button>
                  <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Cancel Order</button>
                </>
              )}
              {selectedOrder.status === 'confirmed' && (
                <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="flex-1 bg-green-500 text-white py-4 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95">Mark as Delivered</button>
              )}
              {selectedOrder.status === 'delivered' && (
                <div className="w-full text-center py-4 text-green-500 font-black uppercase tracking-[0.2em] bg-green-50 rounded-[20px]">
                  Order Completed Successfully
                </div>
              )}
              {selectedOrder.status === 'cancelled' && (
                <div className="w-full text-center py-4 text-red-500 font-black uppercase tracking-[0.2em] bg-red-50 rounded-[20px]">
                  This Order was Cancelled
                </div>
              )}
            </div>
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
