import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  text?: string;
}

export function LogoutButton({ className, showText = true, text = "Logout" }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore backend error for logout
    }
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className={className}>
        <LogOut className="w-5 h-5" />
        {showText && <span>{text}</span>}
      </button>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300 font-sans">
          
          <div className="bg-[#f0f7fb]/80 backdrop-blur-2xl rounded-[2rem] border border-white/80 shadow-[0_16px_64px_rgba(0,0,0,0.1)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            {/* Background glowing orbs */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl z-0 pointer-events-none"></div>

            {/* Header */}
            <div className="p-5 flex items-center gap-2 relative z-10">
              <img src="/logo.png" alt="SWARA" className="w-5 h-5 rounded-md" />
              <span className="font-bold text-[#1f2937] tracking-wider text-xs">SWARA</span>
            </div>

            <div className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
              
              {/* Left Side: Orb Icon */}
              <div className="shrink-0 relative">
                {/* Decorative leaves */}
                <Leaf className="absolute -left-3 top-1/2 text-teal-400 w-6 h-6 -rotate-45 opacity-60 blur-[1px]" />
                <Leaf className="absolute -right-2 bottom-2 text-blue-400 w-5 h-5 rotate-45 opacity-60 blur-[1px]" />
                
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-blue-50/50 border-4 border-white/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05),0_8px_24px_rgba(59,130,246,0.15)] flex items-center justify-center relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-transparent"></div>
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full blur-md opacity-60"></div>
                  <LogOut className="w-10 h-10 text-[#4f46e5] relative z-10 translate-x-1" />
                </div>
              </div>

              {/* Right Side: Text Content */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-extrabold text-[#1f2937] mb-2">Log Out</h3>
                <p className="text-[#374151] font-semibold text-sm mb-2">Are you sure you want to log out?</p>
                <p className="text-[#6b7280] text-xs leading-relaxed">
                  You will be signed out of your account and returned to the login page.
                </p>
              </div>

            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row justify-center md:justify-end gap-3 relative z-10">
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 font-semibold text-slate-600 bg-white/60 hover:bg-white/80 border border-white/60 rounded-full transition-all shadow-sm hover:shadow"
              >
                <X className="w-4 h-4 text-slate-400" /> Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-full transition-all shadow-md shadow-cyan-500/20"
              >
                <LogOut className="w-4 h-4" /> Log Out <ArrowRight className="w-4 h-4 opacity-80" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
