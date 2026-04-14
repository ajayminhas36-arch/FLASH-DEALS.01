import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataService } from '../services/dataService';
import { PriceRequest } from '../types';
import { auth } from '../lib/firebase';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, CheckCircle2, XCircle, ChevronRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Requests() {
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = dataService.subscribeToUserRequests(auth.currentUser.uid, (data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status: PriceRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-orange-500" />;
      case 'approved': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'rejected': return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusBadge = (status: PriceRequest['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Pending</Badge>;
      case 'approved': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Approved</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">My Requests</h1>
          <p className="text-sm text-neutral-500 font-medium">Track your price access</p>
        </div>
        <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
          <ClipboardList size={24} />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Loading Requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/product/${request.productId}`}>
                <Card className="overflow-hidden border-none shadow-premium bg-white rounded-[24px] hover:scale-[1.02] transition-transform">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-inner">
                      <img 
                        src={request.productImage} 
                        alt={request.productName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-black text-base truncate text-neutral-900">{request.productName}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2 rounded-xl text-neutral-300">
                      <ChevronRight size={18} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Clock size={32} className="text-neutral-300" />
          </div>
          <p className="text-neutral-400 font-medium">No requests found</p>
        </div>
      )}
    </div>
  );
}
