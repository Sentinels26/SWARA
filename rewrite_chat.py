import re

chat_file = "/Users/macbookair/Documents/swara1/frontend/src/pages/survivor/Chat.tsx"

new_content = """import { useState, useEffect, useRef } from 'react';
import { Home, ClipboardCheck, MessageCircle, HeartPulse, User, Paperclip, Mic, Send, Activity, ArrowLeft, Bot, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

interface Message {
  id: number;
  sender_role: string;
  message: string;
  timestamp: string;
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript.trim());
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    const initChat = async () => {
      try {
        const res = await api.post('/chat/conversation');
        setConversationId(res.data.id);
        
        const historyRes = await api.get(`/chat/conversation/${res.data.id}/messages`);
        
        if (historyRes.data.length === 0) {
          setMessages([{
            id: -1,
            sender_role: 'assistant',
            message: "Hi there! 👋\\nI'm SWARA, your mental wellness companion.\\nHow are you feeling today? You can share anything on your mind — I'm here to listen, without judgment.",
            timestamp: new Date().toISOString()
          }]);
        } else {
          setMessages(historyRes.data);
        }
      } catch (err) {
        console.error("Failed to init chat", err);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: Date.now(),
      sender_role: 'user',
      message: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post('/chat/message', { message: userText });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send message", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender_role: 'assistant',
        message: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    setSpeechError('');
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not supported in this browser.");
      setTimeout(() => setSpeechError(''), 3000);
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans relative" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Decorative background blurs */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0"></div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 flex-col hidden md:flex sticky top-0 h-screen shrink-0 z-10">
        <div className="flex items-center gap-3 p-8">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md shadow-sm" />
          <div className="font-bold text-xl text-[#1f2937] tracking-wider">SWARA</div>
        </div>
        <nav className="flex-1 py-4 px-6 flex flex-col gap-2 overflow-y-auto">
          <Link to="/survivor/dashboard" className="flex items-center gap-4 px-4 py-3 text-[#4b5563] hover:bg-white/60 font-medium rounded-2xl transition-colors"><Home className="w-5 h-5"/> Home</Link>
          <Link to="/survivor/check-in" className="flex items-center gap-4 px-4 py-3 text-[#4b5563] hover:bg-white/60 font-medium rounded-2xl transition-colors"><ClipboardCheck className="w-5 h-5"/> Check-in</Link>
          <Link to="/survivor/dashboard" className="flex items-center gap-4 px-4 py-3 text-[#4b5563] hover:bg-white/60 font-medium rounded-2xl transition-colors"><Activity className="w-5 h-5"/> My Journey</Link>
          <Link to="/survivor/support" className="flex items-center gap-4 px-4 py-3 text-[#4b5563] hover:bg-white/60 font-medium rounded-2xl transition-colors"><HeartPulse className="w-5 h-5"/> Support</Link>
          <Link to="/survivor/chat" className="flex items-center gap-4 px-4 py-3 bg-white/80 border border-white shadow-sm text-[#2c757c] font-bold rounded-2xl"><MessageCircle className="w-5 h-5"/> Messages</Link>
          <Link to="/survivor/profile" className="flex items-center gap-4 px-4 py-3 text-[#4b5563] hover:bg-white/60 font-medium rounded-2xl transition-colors"><User className="w-5 h-5"/> Profile</Link>
        </nav>
        
        <div className="p-8">
          <div className="text-center">
            <p className="text-xs text-[#2c757c] italic font-serif opacity-80">
              'You are not alone.<br/>Every step you take<br/>matters.' ♡
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative z-10 p-0 md:p-6 lg:p-8 justify-center">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/40 backdrop-blur-xl border-b border-white/60 shrink-0 z-20">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="SWARA" className="w-7 h-7 rounded-md" />
             <span className="font-bold text-[#1f2937] tracking-wider text-sm">SWARA</span>
          </div>
          <div className="flex items-center gap-2 text-[#2c757c]">
             <ShieldCheck className="w-5 h-5" />
             <MoreHorizontal className="w-5 h-5" />
          </div>
        </header>

        {/* Chat Window Container */}
        <div className="flex-1 bg-white/40 backdrop-blur-xl md:rounded-[2.5rem] border border-white/60 flex flex-col overflow-hidden relative w-full max-w-5xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.05)] h-full">
          
          {/* Chat Header */}
          <div className="px-4 py-3 md:px-8 md:py-5 border-b border-white/60 flex items-center justify-between shrink-0 bg-white/60 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-50 to-blue-100 rounded-full border-2 border-white shadow-inner flex items-center justify-center shrink-0 overflow-hidden p-2 relative">
                <div className="absolute inset-0 bg-white/20"></div>
                <img src="/logo.png" alt="Assistant" className="w-full h-full object-contain relative z-10" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#1f2937] flex items-center gap-2">
                  SWARA Assistant
                </h2>
                <div className="text-[11px] md:text-xs font-semibold text-[#4b5563] flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                  <div className="flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                  </div>
                  <span className="hidden md:inline text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">Here to listen, support and guide you.</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 border border-white rounded-full text-xs font-semibold text-[#2c757c]">
                <ShieldCheck className="w-4 h-4" /> Safe & Private
              </div>
              <button className="w-8 h-8 rounded-full bg-white/60 border border-white flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 relative z-10">
            {messages.map(msg => {
              const isUser = msg.sender_role === 'user';

              return (
                <div key={msg.id} className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                  
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[#2c757c] shrink-0 shadow-sm mt-auto mb-5">
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 w-full">
                    <div className={`p-4 md:p-5 text-sm md:text-[15px] leading-relaxed shadow-sm border ${
                      isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-[1.5rem] rounded-br-sm border-blue-400/30' 
                      : 'bg-white/70 backdrop-blur-md text-[#374151] rounded-[1.5rem] rounded-bl-sm border-white/80'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className={`text-[10px] md:text-[11px] font-semibold text-[#6b7280] ${isUser ? 'text-right pr-2' : 'pl-2'} flex items-center gap-1 ${isUser ? 'justify-end' : ''}`}>
                      {formatTime(msg.timestamp)}
                      {isUser && <span className="text-blue-500">✓✓</span>}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0 shadow-sm mt-auto mb-5 text-sm">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                  )}

                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex max-w-[70%] gap-3 mr-auto justify-start">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[#2c757c] shrink-0 shadow-sm mt-auto mb-5">
                  <Bot className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="p-5 bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.5rem] rounded-bl-sm flex gap-1.5 items-center h-[52px]">
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-6 shrink-0 relative z-10 w-full mb-16 md:mb-0">
            {speechError && (
              <div className="text-red-500 text-xs font-semibold mb-2 text-center">
                {speechError}
              </div>
            )}
            <form onSubmit={sendMessage} className="relative flex items-center w-full max-w-4xl mx-auto">
              
              <div className="flex items-center w-full bg-white/80 backdrop-blur-xl border border-white/80 rounded-full py-2 pl-4 pr-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-2 shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>

                <input 
                  type="text"
                  name="message"
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none text-slate-700 text-sm md:text-[15px] px-2 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-0 w-full placeholder-slate-400 font-medium"
                  disabled={isLoading || !conversationId}
                />
                
                <div className="flex items-center gap-1 md:gap-2 shrink-0 pr-1">
                  {/* Voice Input Button */}
                  <button 
                    type="button" 
                    onClick={toggleListening}
                    className={`p-2 transition-colors rounded-full ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-[#2c757c] hover:bg-white/50'}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  
                  {/* Send Button */}
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !conversationId} 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${!input.trim() || isLoading || !conversationId ? 'bg-[#d4eae8] text-[#90c4bf]' : 'bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white shadow-teal-900/20'}`}
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5 md:ml-1" />
                  </button>
                </div>
              </div>
              
            </form>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation (Matching aesthetic) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/60 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400">
          <Home className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/check-in" className="flex flex-col items-center gap-1.5 text-slate-400">
          <ClipboardCheck className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400">
          <Activity className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/chat" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <MessageCircle className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/profile" className="flex flex-col items-center gap-1.5 text-slate-400">
          <User className="w-5 h-5"/>
        </Link>
      </nav>

    </div>
  );
}
"""

with open(chat_file, "w") as f:
    f.write(new_content)

print("Chat screen modified successfully.")
