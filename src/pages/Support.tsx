import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send,
  User,
  HelpCircle,
  Bot,
  Sparkles
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

import { UserProfile } from '../types';

interface SupportProps {
  profile: UserProfile | null;
}

export default function Support({ profile }: SupportProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || auth.currentUser?.email || '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await dataService.sendSupportMessage({
        ...formData,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid
      });
      setIsSent(true);
      toast.success('Message sent successfully!');
      setFormData({ ...formData, message: '' });
    } catch (error) {
      console.error("Support error:", error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-full bg-neutral-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-premium"
        >
          <Send size={40} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Message Sent!</h2>
          <p className="text-neutral-500 font-medium leading-relaxed">
            Thank you for contacting us. Your message has been sent directly to our admin team. We will get back to you as soon as possible.
          </p>
        </div>
        <Button variant="orange" className="w-full h-14 rounded-2xl shadow-orange" onClick={() => navigate('/')}>
          BACK TO HOME
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-30 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="bg-neutral-100 p-2 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black tracking-tight">Help & Support</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <div className="bg-orange-gradient w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-orange mx-auto">
            <HelpCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">How can we help?</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Welcome to Help & Support. We are here to assist you with any issues related to orders, payments, product information, or app usage. If you face any problem, feel free to contact our support team anytime.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-premium bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <Mail size={20} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Email Us</span>
                <span className="text-xs font-bold text-neutral-800">meenaenterprises973@gmail.com</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-premium bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                <Phone size={20} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Call Us</span>
                <span className="text-xs font-bold text-neutral-800">+1 800 FLASH SALE</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Chatbot Promo */}
        <Card className="border-none shadow-premium bg-orange-gradient text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Bot size={80} />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg">Chat with Flash Assistant</h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed">
                  Get instant answers to your questions about products, orders, and more from our AI assistant.
                </p>
                <Button 
                  variant="secondary" 
                  className="mt-4 bg-white text-orange-600 hover:bg-white/90 font-black text-xs uppercase tracking-widest h-10 rounded-xl"
                  onClick={() => {
                    // This will trigger the floating chatbot button
                    const chatBtn = document.querySelector('button[class*="fixed bottom-28"]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }}
                >
                  START AI CHAT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-400 font-black text-xs uppercase tracking-widest">
            <MessageSquare size={14} />
            <span>Send us a message</span>
          </div>
          <Card className="border-none shadow-premium bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-neutral-300" size={18} />
                    <Input 
                      className="pl-10 h-12 rounded-xl border-neutral-100" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-neutral-300" size={18} />
                    <Input 
                      type="email"
                      className="pl-10 h-12 rounded-xl border-neutral-100" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-neutral-400">Message</Label>
                  <Textarea 
                    className="min-h-[120px] rounded-xl border-neutral-100 resize-none" 
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit"
                  variant="orange" 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-orange"
                  disabled={loading}
                >
                  {loading ? 'SENDING...' : (
                    <>
                      <Send size={20} className="mr-2" />
                      SUBMIT MESSAGE
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
