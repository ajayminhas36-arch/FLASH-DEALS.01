import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { dataService } from '../services/dataService';
import { auth } from '../lib/firebase';


interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hi! I am your FlashAssistant. How can I help you today, sir/madam?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Log to Admin Panel (Support Messages)
      if (auth.currentUser) {
        dataService.sendSupportMessage({
          userId: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Customer',
          email: auth.currentUser.email || 'No Email',
          message: `[Chatbot Query]: ${userMessage}`,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Failed to log chat:", err));
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({
            role: m.role === 'bot' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from AI server');
      }

      const data = await response.json();
      const botResponse = data.text || "I will certainly look into that for you, sir/madam. How else may I assist you today?";
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "I am truly sorry for the delay, sir/madam. I am working on getting back to you as quickly as possible. Please explore our products in the meantime!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', content: 'Hi! I am your FlashAssistant. How can I help you today, sir/madam?' }]);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-orange-gradient rounded-full flex items-center justify-center text-white shadow-orange z-40"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-48px)] max-w-[360px] h-[550px] bg-white rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden border border-neutral-100"
          >
            {/* Header */}
            <div className="bg-orange-gradient p-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">Flash Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Clear Chat">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-neutral-50/50" viewportRef={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-orange-100 text-orange-600" : "bg-white text-neutral-600 border border-neutral-100"
                    )}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={cn(
                      "p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-orange-600 text-white rounded-tr-none" 
                        : "bg-white text-neutral-800 rounded-tl-none border border-neutral-100"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 mr-auto max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-white text-neutral-600 flex items-center justify-center border border-neutral-100 shadow-sm">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-neutral-100 flex gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="h-12 rounded-xl border-none shadow-inner bg-white font-medium"
                />
                <Button 
                  type="submit"
                  variant="orange" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl flex-shrink-0"
                  disabled={isLoading}
                >
                  <Send size={18} />
                </Button>
              </form>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Sparkles size={10} className="text-orange-400" />
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Powered by Gemini AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
