import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Product, PriceRequest } from '../types';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, Share2, Heart, ShieldCheck, Truck, RotateCcw, Lock, Check, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<PriceRequest['status'] | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success('Added to cart!');
    }, 1000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const unsubscribe = dataService.subscribeToProducts((products) => {
        const found = products.find(p => p.id === id);
        setProduct(found || null);
        setLoading(false);
      });

      if (auth.currentUser) {
        const unsubRequests = dataService.subscribeToUserRequests(auth.currentUser.uid, (requests) => {
          const req = requests.find(r => r.productId === id);
          if (req) setRequestStatus(req.status);
        });
        return () => {
          unsubscribe();
          unsubRequests();
        };
      }

      return () => unsubscribe();
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product || !auth.currentUser) return;
    navigate('/checkout', { state: { product } });
  };

  const handleRequestPrice = async () => {
    if (!product || !auth.currentUser) return;
    try {
      await dataService.createPriceRequest(
        auth.currentUser.uid,
        product.id,
        product.name,
        product.image
      );
      toast.success('Price request sent!');
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="bg-white min-h-full">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 flex justify-between items-center p-4">
        <button onClick={() => navigate(-1)} className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md relative">
            <ShoppingCart size={20} />
            <AnimatePresence>
              {isAddingToCart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-[8px] text-white font-black"
                >
                  1
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md">
            <Share2 size={20} />
          </button>
          <button className="bg-white/80 backdrop-blur p-2 rounded-full shadow-md">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <motion.div 
        layoutId={`card-${product.id}`}
        className="relative aspect-square bg-neutral-100 overflow-hidden"
      >
        {product.videoUrl ? (
          <video 
            src={product.videoUrl} 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <motion.img 
            layoutId={`image-${product.id}`}
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        {product.isActive && (
          <Badge className="absolute bottom-6 left-6 bg-orange-gradient text-white border-none px-4 py-2 text-sm font-black shadow-orange-glow rounded-xl animate-pulse-orange">
            FLASH DEAL
          </Badge>
        )}
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="p-6 space-y-8 pb-64 -mt-8 bg-white rounded-t-[48px] relative z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.08)]"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{product.category}</span>
              <h1 className="text-3xl font-black tracking-tight leading-tight text-neutral-900">{product.name}</h1>
            </div>
            <div className="text-right">
              {product.isActive ? (
                <div className="flex flex-col items-end">
                  <span className="text-sm text-neutral-400 line-through font-bold">${product.originalPrice}</span>
                  <span className="text-4xl font-black text-orange-600 tracking-tighter">${product.discountedPrice}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-xl text-neutral-400">
                  <Lock size={16} />
                  <span className="text-sm font-black uppercase">Locked</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-neutral-500 leading-relaxed font-medium">{product.description}</p>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 py-6 border-y border-neutral-100"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">1 Year Warranty</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck size={24} />
            </div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <RotateCcw size={24} />
            </div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">7 Days Return</span>
          </div>
        </motion.div>

        {/* Stock Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={cn(
            "bg-neutral-50 p-5 rounded-[24px] flex justify-between items-center border border-neutral-100",
            product.stock <= 5 && product.stock > 0 && "animate-shake border-orange-200 bg-orange-50/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              product.stock > 5 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            )} />
            <span className="text-sm font-black text-neutral-600 uppercase tracking-wider">Availability</span>
          </div>
          <span className={cn(
            "text-sm font-black uppercase tracking-wider",
            product.stock > 5 ? "text-neutral-900" : 
            product.stock > 0 ? "text-orange-600" : "text-red-600"
          )}>
            {product.stock > 0 ? `${product.stock} Units Left` : 'Out of Stock'}
          </span>
        </motion.div>
      </motion.div>

      {/* Footer Action */}
      <div className="fixed bottom-[100px] left-4 right-4 max-w-[calc(448px-32px)] mx-auto p-4 bg-white/95 backdrop-blur-xl border border-neutral-100 z-40 rounded-[24px] shadow-premium">
        {product.isActive ? (
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleAddToCart}
              className="flex-1 h-14 rounded-2xl text-lg font-black border-2 border-orange-600 text-orange-600 hover:bg-orange-50 relative overflow-hidden"
              disabled={product.stock <= 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: -40 }}
                  className="flex flex-col items-center"
                >
                  <span>ADDING...</span>
                </motion.div>
              ) : (
                'ADD TO CART'
              )}
              <AnimatePresence>
                {isAddingToCart && (
                  <motion.div
                    initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      scale: 0.2, 
                      x: 150, 
                      y: -500, 
                      opacity: 0 
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <img src={product.image} className="w-12 h-12 rounded-full object-cover shadow-orange-glow" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <Button 
              variant={isPurchased ? "default" : "orange"}
              onClick={handleBuyNow}
              className={cn(
                "flex-[1.5] h-14 rounded-2xl text-lg font-black shadow-xl transition-all duration-300",
                isPurchased && "bg-green-600 hover:bg-green-600 text-white shadow-green-200"
              )}
              disabled={product.stock <= 0 || isPurchasing || isPurchased}
            >
              {isPurchased ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={24} strokeWidth={3} />
                  <span>ORDERED!</span>
                </motion.div>
              ) : isPurchasing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>PROCESSING...</span>
                </div>
              ) : (
                product.stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'
              )}
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline"
            onClick={handleRequestPrice}
            className={cn(
              "w-full h-14 rounded-2xl text-lg font-black shadow-xl transition-all duration-300 border-2",
              requestStatus === null ? "border-orange-600 text-orange-600 hover:bg-orange-50" : "bg-neutral-100 text-neutral-400 border-neutral-200"
            )}
            disabled={requestStatus !== null}
          >
            {requestStatus === 'pending' ? 'REQUEST PENDING' : 
             requestStatus === 'approved' ? 'REQUEST APPROVED' : 
             requestStatus === 'rejected' ? 'REQUEST REJECTED' : 
             'REQUEST PRICE'}
          </Button>
        )}
      </div>
    </div>
  );
}
