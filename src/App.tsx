import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { dataService } from './services/dataService';
import { UserProfile } from './types';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { ShieldAlert } from 'lucide-react';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Requests from './pages/Requests';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        if (firebaseUser) {
          console.log("User authenticated:", firebaseUser.uid);
          let userProfile = await dataService.getUserProfile(firebaseUser.uid);
          console.log("Fetched profile:", userProfile);
          
          // Check if user should be admin based on email
          const isAdminEmail = firebaseUser.email === 'ajayminhas36@gmail.com' || firebaseUser.email === 'meenaenterprises973@gmail.com';
          
          if (!userProfile) {
            console.log("Profile not found, creating new one...");
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'guest@example.com',
              name: firebaseUser.displayName || 'Guest User',
              totalSpending: 0,
              role: isAdminEmail ? 'admin' : 'user'
            };
            await dataService.updateUserProfile(firebaseUser.uid, newProfile);
            userProfile = newProfile;
            console.log("Created new profile:", userProfile);
          } else if (isAdminEmail && userProfile.role !== 'admin') {
            console.log("Updating user to admin role...");
            // Update role to admin if it's not set but email matches
            await dataService.updateUserProfile(firebaseUser.uid, { role: 'admin' });
            userProfile.role = 'admin';
          }
          
          setProfile(userProfile);
          setUser(firebaseUser);
        } else {
          console.log("No user authenticated");
          setUser(null);
          setProfile(null);
        }
      } catch (err: any) {
        console.error("Auth state change error:", err);
        const errorMessage = err.message || "Failed to load user profile";
        setError(errorMessage);
        toast.error(errorMessage);
        // Even if profile fetch fails, we should still set the user if they are authenticated
        setUser(firebaseUser);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="text-sm text-neutral-500 font-medium animate-pulse">Initializing Secure Session...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 p-6 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <ShieldAlert className="text-red-600" size={32} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Connection Error</h1>
        <p className="text-neutral-500 mb-6 max-w-xs">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-orange-600 hover:bg-orange-700"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {!user ? (
          <Route path="*" element={<Auth />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/support" element={<Support profile={profile} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {profile?.role === 'admin' && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}
