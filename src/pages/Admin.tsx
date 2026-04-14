import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Package, 
  Plus, 
  Check, 
  X, 
  ChevronRight,
  Clock,
  Users,
  TrendingUp,
  Power,
  Edit2,
  Save,
  Trash2,
  Play,
  MessageSquare,
  Mail,
  Image as ImageIcon
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Order, PriceRequest, FlashReel, SupportMessage, Banner } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

type AdminTab = 'dashboard' | 'orders' | 'requests' | 'products' | 'reels' | 'support' | 'banners';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reels, setReels] = useState<FlashReel[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, activeDeals: 0 });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingReel, setIsAddingReel] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image: '',
    badge: 'Exclusive Offer'
  });

  useEffect(() => {
    const unsubOrders = dataService.subscribeToAllOrders(setOrders);
    const unsubRequests = dataService.subscribeToAllRequests(setRequests);
    const unsubProducts = dataService.subscribeToProducts(setProducts);
    const unsubReels = dataService.subscribeToReels(setReels);
    const unsubMessages = dataService.subscribeToSupportMessages(setMessages);
    const unsubBanners = dataService.subscribeToBanners(setBanners);
    
    const fetchStats = async () => {
      const s = await dataService.getAdminStats();
      setStats(s);
    };
    fetchStats();

    return () => {
      unsubOrders();
      unsubRequests();
      unsubProducts();
      unsubReels();
      unsubMessages();
      unsubBanners();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await dataService.updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: PriceRequest['status']) => {
    try {
      await dataService.updateRequestStatus(requestId, status);
      toast.success(`Request ${status}`);
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleToggleProduct = async (product: Product) => {
    try {
      await dataService.updateProduct(product.id, { isActive: !product.isActive });
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    originalPrice: 0,
    discountedPrice: 0,
    stock: 0,
    image: '',
    videoUrl: '',
    category: 'Flash Deal',
    isActive: true
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.image || newProduct.originalPrice <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await dataService.addProduct(newProduct);
      toast.success('Product added successfully');
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        originalPrice: 0,
        discountedPrice: 0,
        stock: 0,
        image: '',
        videoUrl: '',
        category: 'Flash Deal',
        isActive: true
      });
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const [newReel, setNewReel] = useState({
    title: '',
    videoUrl: '',
    productId: '',
    category: 'Flash Deal'
  });

  const handleAddReel = async () => {
    if (!newReel.title || !newReel.videoUrl) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await dataService.addReel({
        ...newReel,
        timestamp: new Date().toISOString()
      });
      toast.success('Flash Reel added!');
      setIsAddingReel(false);
      setNewReel({ title: '', videoUrl: '', productId: '', category: 'Flash Deal' });
    } catch (error) {
      toast.error('Failed to add reel');
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    try {
      await dataService.deleteReel(id);
      toast.success('Reel deleted');
    } catch (error) {
      toast.error('Failed to delete reel');
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.image) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await dataService.addBanner({
        ...newBanner,
        timestamp: new Date().toISOString()
      });
      toast.success('Banner added!');
      setIsAddingBanner(false);
      setNewBanner({ title: '', subtitle: '', image: '', badge: 'Exclusive Offer' });
    } catch (error) {
      toast.error('Failed to add banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await dataService.deleteBanner(id);
      toast.success('Banner deleted');
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="min-h-full bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-6 sticky top-0 z-30">
        <h1 className="text-2xl font-black tracking-tight text-neutral-900">Admin Panel</h1>
        <p className="text-sm text-neutral-500 font-medium">Manage your flash sale empire</p>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-white border-b border-neutral-200 overflow-x-auto scrollbar-hide sticky top-[81px] z-30">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
          { id: 'orders', icon: ShoppingBag, label: 'Orders' },
          { id: 'requests', icon: ClipboardList, label: 'Requests' },
          { id: 'products', icon: Package, label: 'Products' },
          { id: 'reels', icon: Play, label: 'Reels' },
          { id: 'banners', icon: ImageIcon, label: 'Banners' },
          { id: 'support', icon: MessageSquare, label: 'Support', count: messages.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative",
              activeTab === tab.id 
                ? "bg-orange-gradient text-white shadow-orange" 
                : "text-neutral-500 hover:bg-neutral-100"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-premium bg-white">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-neutral-900">{stats.totalOrders}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Orders</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-white">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                      <Users size={24} />
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-neutral-900">{stats.totalUsers}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Users</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-white">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-neutral-900">{stats.activeDeals}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Active Deals</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-white">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-neutral-900">{requests.filter(r => r.status === 'pending').length}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pending Req</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {orders.map((order) => (
                <Card key={order.id} className="border-none shadow-premium overflow-hidden">
                  <div className="bg-neutral-50 p-3 border-b border-neutral-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-neutral-400 uppercase">Order #{order.id.slice(0, 8)}</span>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase",
                      order.status === 'placed' ? "bg-blue-100 text-blue-600" :
                      order.status === 'processing' ? "bg-orange-100 text-orange-600" :
                      order.status === 'dispatched' ? "bg-purple-100 text-purple-600" :
                      "bg-green-100 text-green-600"
                    )}>
                      {order.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex gap-4">
                      <img src={order.productDetails.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-sm">{order.productDetails.name}</h3>
                        <p className="text-xs text-neutral-500">Qty: {order.quantity} • ${order.price}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <p className="font-bold text-neutral-700">Shipping Details:</p>
                      <p>{order.address}</p>
                      <p>{order.city}, {order.pincode}</p>
                      <p>Phone: {order.phone}</p>
                      <p className="font-bold text-orange-600 mt-1">Method: {order.paymentMethod}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {order.status === 'placed' && (
                        <Button size="sm" variant="orange" className="w-full" onClick={() => handleUpdateOrderStatus(order.id, 'processing')}>
                          Process
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" variant="orange" className="w-full" onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}>
                          Dispatch
                        </Button>
                      )}
                      {order.status === 'dispatched' && (
                        <Button size="sm" variant="orange" className="w-full" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                          Deliver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {requests.map((req) => (
                <Card key={req.id} className="border-none shadow-premium">
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={req.productImage} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{req.productName}</h3>
                      <p className="text-[10px] text-neutral-400">{new Date(req.timestamp).toLocaleString()}</p>
                      <Badge className={cn(
                        "mt-2 text-[9px] font-black uppercase",
                        req.status === 'pending' ? "bg-neutral-100 text-neutral-500" :
                        req.status === 'approved' ? "bg-green-100 text-green-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {req.status}
                      </Badge>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <Button size="icon-sm" variant="orange" onClick={() => handleUpdateRequestStatus(req.id, 'approved')}>
                          <Check size={16} />
                        </Button>
                        <Button size="icon-sm" variant="outline" className="text-red-500 border-red-200" onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}>
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Button variant="orange" className="w-full h-12 rounded-2xl shadow-orange" onClick={() => setIsAddingProduct(true)}>
                <Plus size={20} className="mr-2" /> Add New Product
              </Button>

              {products.map((product) => (
                <Card key={product.id} className="border-none shadow-premium overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <img src={product.image} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-neutral-500">${product.discountedPrice || product.originalPrice}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={product.isActive ? "default" : "outline"} className={cn(
                          "text-[9px] font-black uppercase",
                          product.isActive ? "bg-orange-gradient" : "text-neutral-400"
                        )}>
                          {product.isActive ? 'Active Deal' : 'Locked'}
                        </Badge>
                        <span className="text-[10px] font-bold text-neutral-400">Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="icon-sm" variant="ghost" onClick={() => handleToggleProduct(product)}>
                        <Power size={18} className={product.isActive ? "text-green-500" : "text-neutral-300"} />
                      </Button>
                      <Button size="icon-sm" variant="ghost">
                        <Edit2 size={18} className="text-blue-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
          {activeTab === 'reels' && (
            <motion.div
              key="reels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Button variant="orange" className="w-full h-12 rounded-2xl shadow-orange" onClick={() => setIsAddingReel(true)}>
                <Plus size={20} className="mr-2" /> Add New Reel
              </Button>

              {reels.map((reel) => (
                <Card key={reel.id} className="border-none shadow-premium overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-24 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                      <video src={reel.videoUrl} className="w-full h-full object-cover" muted />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate">{reel.title}</h3>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{reel.category}</p>
                      {reel.productId && (
                        <div className="flex items-center gap-1 mt-1">
                          <ShoppingBag size={10} className="text-orange-500" />
                          <span className="text-[9px] text-neutral-500">Linked to Product</span>
                        </div>
                      )}
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteReel(reel.id)}>
                      <Trash2 size={18} className="text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
          {activeTab === 'banners' && (
            <motion.div
              key="banners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Button variant="orange" className="w-full h-12 rounded-2xl shadow-orange" onClick={() => setIsAddingBanner(true)}>
                <Plus size={20} className="mr-2" /> Add New Banner
              </Button>

              {banners.map((banner) => (
                <Card key={banner.id} className="border-none shadow-premium overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-24 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img src={banner.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate">{banner.title}</h3>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest truncate">{banner.subtitle}</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase mt-1">
                        {banner.badge}
                      </Badge>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteBanner(banner.id)}>
                      <Trash2 size={18} className="text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-neutral-100">
                  <MessageSquare className="mx-auto text-neutral-200 mb-4" size={48} />
                  <p className="text-neutral-400 font-bold">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <Card key={msg.id} className="border-none shadow-premium overflow-hidden">
                    <div className="bg-neutral-50 p-3 border-b border-neutral-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase">{msg.email}</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-sm text-neutral-900">{msg.name}</h3>
                          {msg.message.startsWith('[Chatbot Query]') && (
                            <Badge className="bg-blue-100 text-blue-600 border-none text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                              AI Log
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm mt-2 leading-relaxed p-4 rounded-2xl border",
                          msg.message.startsWith('[Chatbot Query]') 
                            ? "bg-blue-50/50 border-blue-100 text-blue-900 italic" 
                            : "bg-neutral-50 border-neutral-100 text-neutral-600"
                        )}>
                          {msg.message.startsWith('[Chatbot Query]') 
                            ? msg.message.replace('[Chatbot Query]: ', '') 
                            : msg.message}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] font-black uppercase tracking-widest h-8"
                          onClick={() => window.location.href = `mailto:${msg.email}`}
                        >
                          Reply via Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Banner Modal */}
      {isAddingBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Add New Banner</h2>
              <button onClick={() => setIsAddingBanner(false)} className="bg-neutral-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Title</Label>
                <Input 
                  placeholder="e.g. MEGA FLASH SALE" 
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input 
                  placeholder="e.g. Up to 70% OFF" 
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={newBanner.image}
                  onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input 
                  placeholder="e.g. Limited Time" 
                  value={newBanner.badge}
                  onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                />
              </div>
              <Button 
                variant="orange" 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-orange"
                onClick={handleAddBanner}
              >
                SAVE BANNER
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Reel Modal */}
      {isAddingReel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Add Flash Reel</h2>
              <button onClick={() => setIsAddingReel(false)} className="bg-neutral-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reel Title</Label>
                <Input 
                  placeholder="e.g. New iPhone 15 Pro Max Demo" 
                  value={newReel.title}
                  onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (Direct link to .mp4)</Label>
                <Input 
                  placeholder="https://..." 
                  value={newReel.videoUrl}
                  onChange={(e) => setNewReel({ ...newReel, videoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link to Product (Optional ID)</Label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newReel.productId}
                  onChange={(e) => setNewReel({ ...newReel, productId: e.target.value })}
                >
                  <option value="">No Product Link</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input 
                  placeholder="Flash Deal" 
                  value={newReel.category}
                  onChange={(e) => setNewReel({ ...newReel, category: e.target.value })}
                />
              </div>
              <Button 
                variant="orange" 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-orange"
                onClick={handleAddReel}
              >
                UPLOAD REEL
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Product Modal (Simplified) */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Add New Product</h2>
              <button onClick={() => setIsAddingProduct(false)} className="bg-neutral-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input 
                  placeholder="e.g. iPhone 15 Pro" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Price ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="999" 
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="799" 
                    value={newProduct.discountedPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountedPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    placeholder="Flash Deal" 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (Optional - 5-6s recommended)</Label>
                <Input 
                  placeholder="https://..." 
                  value={newProduct.videoUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                />
              </div>
              <Button 
                variant="orange" 
                className="w-full h-14 rounded-2xl font-black text-lg shadow-orange"
                onClick={handleAddProduct}
              >
                SAVE PRODUCT
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
