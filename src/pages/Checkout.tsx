import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Order } from '../types';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product as Product;
  
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'COD' as 'COD' | 'Online'
  });

  const lookupPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setIsPincodeLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: `${postOffice.Name}, ${postOffice.District}`,
          pincode: pincode
        }));
        toast.success(`Location found: ${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`);
      } else {
        toast.error("Invalid pincode");
      }
    } catch (error) {
      console.error("Pincode error:", error);
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, pincode: val });
    if (val.length === 6) {
      lookupPincode(val);
    }
  };

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }
    
    // Pre-fill from profile if available
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const profile = await dataService.getUserProfile(auth.currentUser.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.name || '',
            phone: profile.phone || '',
            address: profile.address || ''
          }));
        }
      }
    };
    fetchProfile();
  }, [product, navigate]);

  const handleConfirmOrder = async () => {
    if (!product || !auth.currentUser) return;
    
    // Validation
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error('Please fill all delivery details');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: Omit<Order, 'id'> = {
        userId: auth.currentUser.uid,
        productId: product.id,
        price: (product.discountedPrice || product.originalPrice) * quantity,
        status: 'placed',
        timestamp: new Date().toISOString(),
        productDetails: product,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        quantity
      };

      // Run operations in parallel for speed
      await Promise.all([
        dataService.createOrder(orderData),
        dataService.updateProduct(product.id, { stock: product.stock - quantity })
      ]);
      
      setIsSuccess(true);
      toast.success('Order placed successfully!');
      
      // Automatically navigate to orders after 800ms
      setTimeout(() => {
        navigate('/orders');
      }, 800);
    } catch (error) {
      toast.error('Failed to place order');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600"
        >
          <CheckCircle2 size={60} strokeWidth={2.5} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Order Placed!</h1>
          <p className="text-neutral-500 font-medium">Your order has been successfully placed and will be processed soon.</p>
        </div>
        <div className="bg-neutral-50 p-6 rounded-3xl w-full space-y-4 border border-neutral-100">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400 font-bold uppercase">Order ID</span>
            <span className="text-neutral-900 font-black">#FLASH-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400 font-bold uppercase">Total Amount</span>
            <span className="text-orange-600 font-black">${(product.discountedPrice || product.originalPrice) * quantity}</span>
          </div>
        </div>
        <Button variant="orange" className="w-full h-14 rounded-2xl font-black text-lg shadow-orange" onClick={() => navigate('/orders')}>
          VIEW MY ORDERS
        </Button>
        <Button variant="ghost" className="text-neutral-400 font-bold" onClick={() => navigate('/')}>
          CONTINUE SHOPPING
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-50 pb-32">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-30 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="bg-neutral-100 p-2 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black tracking-tight">Checkout</h1>
      </div>

      <div className="p-4 space-y-6 pb-64">
        {/* Product Summary */}
        <Card className="border-none shadow-premium overflow-hidden bg-white rounded-[32px]">
          <CardContent className="p-5 flex gap-5">
            <div className="w-24 h-24 rounded-[24px] overflow-hidden bg-neutral-100 shadow-inner flex-shrink-0">
              <img src={product.image} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{product.category}</span>
                <h2 className="font-black text-lg leading-tight text-neutral-900">{product.name}</h2>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl p-1.5 px-3 border border-neutral-100">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-neutral-400 hover:text-orange-600"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="font-black text-base w-4 text-center text-neutral-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-neutral-400 hover:text-orange-600"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Subtotal</span>
                  <span className="font-black text-orange-600 text-xl tracking-tighter">
                    ${(product.discountedPrice || product.originalPrice) * quantity}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-neutral-900 font-black text-xs uppercase tracking-widest">
              <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                <MapPin size={14} />
              </div>
              <span>Delivery Address</span>
            </div>
          </div>
          <Card className="border-none shadow-premium bg-white rounded-[32px]">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <Input 
                    className="pl-12 h-14 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all font-bold" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <Input 
                    className="pl-12 h-14 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all font-bold" 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Full Address</Label>
                <Input 
                  className="h-14 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all font-bold px-4" 
                  placeholder="Street, House No, Area"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">City</Label>
                  <Input 
                    className="h-14 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all font-bold px-4" 
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Pincode</Label>
                  <div className="relative">
                    <Input 
                      className="h-14 rounded-2xl border-neutral-100 bg-neutral-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all font-bold px-4" 
                      placeholder="6 Digit Pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                    />
                    {isPincodeLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-900 font-black text-xs uppercase tracking-widest px-2">
            <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
              <CreditCard size={14} />
            </div>
            <span>Payment Method</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
              className={cn(
                "p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                formData.paymentMethod === 'COD' 
                  ? "border-orange-500 bg-orange-50 text-orange-600 shadow-orange-glow" 
                  : "border-white bg-white text-neutral-400 hover:border-neutral-100"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                formData.paymentMethod === 'COD' ? "bg-orange-600 text-white" : "bg-neutral-50 text-neutral-400"
              )}>
                <Truck size={24} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">Cash on Delivery</span>
              {formData.paymentMethod === 'COD' && (
                <motion.div layoutId="payment-check" className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-orange-600" />
                </motion.div>
              )}
            </button>
            <button
              onClick={() => setFormData({...formData, paymentMethod: 'Online'})}
              className={cn(
                "p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                formData.paymentMethod === 'Online' 
                  ? "border-orange-500 bg-orange-50 text-orange-600 shadow-orange-glow" 
                  : "border-white bg-white text-neutral-400 hover:border-neutral-100"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                formData.paymentMethod === 'Online' ? "bg-orange-600 text-white" : "bg-neutral-50 text-neutral-400"
              )}>
                <CreditCard size={24} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">Online Payment</span>
              {formData.paymentMethod === 'Online' && (
                <motion.div layoutId="payment-check" className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-orange-600" />
                </motion.div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-[100px] left-4 right-4 max-w-[calc(448px-32px)] mx-auto p-4 bg-white/95 backdrop-blur-xl border border-neutral-100 z-40 rounded-[24px] shadow-premium">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Payable</span>
            <span className="text-2xl font-black text-orange-600">
              ${(product.discountedPrice || product.originalPrice) * quantity}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Items</span>
            <span className="block font-black text-neutral-900">{quantity} Product(s)</span>
          </div>
        </div>
        <Button 
          variant="orange"
          onClick={handleConfirmOrder}
          className="w-full h-14 rounded-2xl text-lg font-black shadow-orange"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>CONFIRMING...</span>
            </div>
          ) : (
            'CONFIRM ORDER'
          )}
        </Button>
      </div>
    </div>
  );
}
