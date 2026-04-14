import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../lib/firebase';
import { dataService } from '../services/dataService';
import { UserProfile, Order, PriceRequest } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  LogOut, 
  ShoppingBag, 
  ClipboardList, 
  HelpCircle, 
  Share2, 
  ChevronRight,
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Camera,
  X,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProfileProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
];

export default function Profile({ profile, setProfile }: ProfileProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Profile component rendered with profile:", profile);
  }, [profile]);

  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<PriceRequest[]>([]);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });

      const unsubOrders = dataService.subscribeToUserOrders(profile.uid, setOrders);
      const unsubRequests = dataService.subscribeToUserRequests(profile.uid, setRequests);
      
      return () => {
        unsubOrders();
        unsubRequests();
      };
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      await dataService.updateUserProfile(profile.uid, editData);
      setProfile({ ...profile, ...editData });
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleSelectAvatar = async (url: string) => {
    if (!profile) return;
    try {
      await dataService.updateUserProfile(profile.uid, { avatarUrl: url });
      setProfile({ ...profile, avatarUrl: url });
      setIsAvatarModalOpen(false);
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'FlashDeal Mobile',
      text: 'Check out this amazing Daily Flash Sale App with huge discounts every day!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', count: orders.length, onClick: () => navigate('/orders') },
    { icon: ClipboardList, label: 'My Requests', count: requests.length, onClick: () => navigate('/requests') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => navigate('/support') },
    { icon: ShieldCheck, label: 'Privacy Policy', onClick: () => navigate('/privacy') },
    { icon: Share2, label: 'Share App', onClick: handleShare }
  ];

  if (profile?.role === 'admin') {
    menuItems.unshift({ icon: LayoutDashboard, label: 'Admin Panel', onClick: () => navigate('/admin'), count: undefined });
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 p-6 text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="text-orange-200" size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-black text-neutral-900">Loading Profile</p>
          <p className="text-neutral-500 font-medium text-sm max-w-[200px]">We're fetching your secure account data...</p>
        </div>
        <div className="flex flex-col w-full gap-3 max-w-[200px]">
          <Button variant="orange" className="w-full shadow-orange" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
          <div className="pt-4">
            <p className="text-[10px] text-neutral-400 font-mono break-all">
              UID: {auth.currentUser?.uid || 'Not Logged In'}<br/>
              Email: {auth.currentUser?.email || 'No Email'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-neutral-900">Profile</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Settings size={20} className={isEditing ? "text-orange-600" : "text-neutral-400"} />
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-none shadow-premium bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-orange-glow ring-4 ring-orange-50 overflow-hidden">
                <AvatarImage src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} />
                <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 bg-orange-gradient p-2 rounded-full text-white shadow-orange scale-0 group-hover:scale-100 transition-transform duration-300"
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900">{profile.name || 'User'}</h2>
              <p className="text-sm text-neutral-400 font-medium">{profile.email}</p>
              {profile.role === 'admin' && (
                <Badge className="mt-2 bg-orange-gradient text-white border-none text-[10px] font-black uppercase">Admin</Badge>
              )}
            </div>
            <div className="flex gap-8 pt-2">
              <div className="text-center">
                <span className="block text-lg font-black text-neutral-900">${profile.totalSpending || 0}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Spent</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black text-neutral-900">{orders.length}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Orders</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form / Menu */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4 bg-white p-6 rounded-3xl shadow-premium border border-neutral-100"
          >
            <h3 className="font-black text-lg mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-neutral-300" size={18} />
                  <Input 
                    className="pl-10 h-12 rounded-xl border-neutral-100" 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-neutral-300" size={18} />
                  <Input 
                    className="pl-10 h-12 rounded-xl border-neutral-100" 
                    value={editData.phone} 
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-neutral-400">Shipping Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-neutral-300" size={18} />
                  <Input 
                    className="pl-10 h-12 rounded-xl border-neutral-100" 
                    value={editData.address} 
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })} 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="orange" className="flex-1 h-12" onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-premium hover:bg-neutral-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-neutral-100 p-2.5 rounded-xl text-neutral-600 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="font-black text-sm text-neutral-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-orange-gradient text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-orange">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-neutral-300 group-hover:text-orange-400 transition-colors" />
                </div>
              </motion.button>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 p-4 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl mt-4"
              onClick={handleLogout}
            >
              <div className="bg-red-50 p-2.5 rounded-xl">
                <LogOut size={20} />
              </div>
              <span className="font-black text-sm">Logout</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Choose Avatar</h3>
                <button onClick={() => setIsAvatarModalOpen(false)} className="bg-neutral-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((url, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelectAvatar(url)}
                    className={cn(
                      "aspect-square rounded-2xl overflow-hidden border-4 transition-all",
                      profile.avatarUrl === url ? "border-orange-500 shadow-orange-glow" : "border-neutral-100"
                    )}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
