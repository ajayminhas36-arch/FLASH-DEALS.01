import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Product } from '../types';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Timer, Flame, Lock, ArrowRight, Search, X, Package, ShoppingCart, ShoppingBag, ShieldCheck, Truck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import HeroCarousel from '../components/HeroCarousel';
import FlashReels from '../components/FlashReels';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dataService.subscribeToProducts((data) => {
      setProducts(data);
      setIsInitialLoading(false);
    });

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const flashDeals = filteredProducts.filter(p => p.isActive);
  const otherProducts = filteredProducts.filter(p => !p.isActive);

  const FlashDealSkeleton = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-premium relative">
          <div className="aspect-[16/9] bg-neutral-100 animate-shimmer" />
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <div className="h-3 bg-neutral-100 rounded w-1/4 animate-shimmer" />
                <div className="h-8 bg-neutral-100 rounded w-full animate-shimmer" />
              </div>
              <div className="h-10 bg-neutral-100 rounded-xl w-1/4 animate-shimmer" />
            </div>
            <div className="h-14 bg-neutral-100 rounded-2xl w-full animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );

  const OtherProductSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[24px] overflow-hidden shadow-premium relative">
          <div className="aspect-square bg-neutral-100 animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-neutral-100 rounded w-3/4 animate-shimmer" />
            <div className="h-3 bg-neutral-100 rounded w-1/2 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 space-y-8 pb-32">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-orange-500 transition-colors z-10">
          <Search size={20} />
        </div>
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-12 pr-12 h-14 bg-white/80 backdrop-blur-xl border-none shadow-premium rounded-[24px] focus-visible:ring-2 focus-visible:ring-orange-500/50 transition-all font-bold text-neutral-800 placeholder:text-neutral-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-orange-600 transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Flash Reels */}
      <FlashReels />

      {/* Today's Deals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-xl shadow-orange-glow">
              <Flame className="text-white" fill="currentColor" size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Flash Deals</h2>
          </div>
          <Badge variant="outline" className="border-orange-200 text-orange-600 font-bold bg-orange-50">
            Ends Soon
          </Badge>
        </div>

        <div className="space-y-4">
          {isInitialLoading ? (
            <FlashDealSkeleton />
          ) : flashDeals.length > 0 ? (
            flashDeals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          ) : (
            <div className="text-center py-12 bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-200">
              <p className="text-neutral-400">No flash deals active today.</p>
            </div>
          )}
        </div>
      </section>

      {/* Other Products */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-900 p-1.5 rounded-xl">
              <Package className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Other Products</h2>
          </div>
          <Badge variant="secondary" className="bg-neutral-100 text-neutral-400 font-bold border-none">
            Locked
          </Badge>
        </div>

        {isInitialLoading ? (
          <OtherProductSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {otherProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="bg-white rounded-[40px] p-8 shadow-premium space-y-6 border border-neutral-50">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Why Shop With Us?</h2>
          <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Premium Quality Guaranteed</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-black text-sm">Secure Checkout</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Your transactions are protected by industry-leading security protocols.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Truck size={24} />
            </div>
            <h3 className="font-black text-sm">Express Shipping</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Get your favorite products delivered to your doorstep in record time.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Clock size={24} />
            </div>
            <h3 className="font-black text-sm">24/7 Support</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Our dedicated team is always here to help you with any queries.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-black text-sm">Authentic Goods</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">We only source 100% original and high-quality products from top brands.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
