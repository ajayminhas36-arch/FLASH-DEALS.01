import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataService } from '../services/dataService';
import { Order } from '../types';
import { auth } from '../lib/firebase';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Package, Truck, CheckCircle, ChevronRight, ShoppingBag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = dataService.subscribeToUserOrders(auth.currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'placed': return <Package size={16} className="text-blue-500" />;
      case 'processing': return <Clock size={16} className="text-orange-500" />;
      case 'dispatched': return <Truck size={16} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Placed</Badge>;
      case 'processing': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Processing</Badge>;
      case 'dispatched': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Dispatched</Badge>;
      case 'delivered': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Delivered</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">My Orders</h1>
          <p className="text-sm text-neutral-500 font-medium">Track your flash deals</p>
        </div>
        <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
          <ShoppingBag size={24} />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Loading Orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-premium bg-white rounded-[24px]">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-inner">
                      <img 
                        src={order.productDetails.image} 
                        alt={order.productDetails.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-base truncate text-neutral-900">{order.productDetails.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-orange-600">${order.price}</span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Qty: {order.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Order Date</span>
                      <span className="text-[11px] text-neutral-900 font-bold">
                        {new Date(order.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <Link to={`/product/${order.productId}`}>
                      <Button variant="ghost" size="sm" className="text-orange-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 rounded-xl">
                        View Product <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={32} className="text-neutral-300" />
          </div>
          <p className="text-neutral-400 font-medium">No orders yet</p>
          <Link to="/">
            <Button variant="outline" className="mt-2">Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
