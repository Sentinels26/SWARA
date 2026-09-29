import re

welcome_file = "/Users/macbookair/Documents/swara1/frontend/src/pages/welcome/Welcome.tsx"

new_content = """import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

const languages = [
  'English', 'हिंदी', 'বাংলা', 'ગુજરાતી', 'ಕನ್ನಡ', 
  'മലയാളം', 'मराठी', 'ଓଡ଼ିଆ', 'ਪੰਜਾਬੀ', 'தமிழ்', 'తెలుగు', 'اردو'
];

export default function Welcome() {
  const [currentLang, setCurrentLang] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'PROFESSIONAL') {
        navigate('/professional/dashboard', { replace: true });
      } else {
        if (user.onboarding_completed) {
          navigate('/survivor/dashboard', { replace: true });
        } else {
          navigate('/survivor/onboarding', { replace: true });
        }
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Cycle through languages for 3 seconds
    const interval = setInterval(() => {
      setCurrentLang(l => (l + 1) % languages.length);
    }, 250);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setShowOptions(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Make background completely visible, no opaque white blur overlay */}
      
      <div className={`relative z-10 transition-all duration-1000 ease-in-out flex flex-col items-center w-full max-w-4xl h-full justify-center max-h-screen py-4`}>
        
        {/* Logo and Header */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-in-out ${showOptions ? 'transform -translate-y-2' : ''}`}>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/80 backdrop-blur-md rounded-[1.5rem] p-3 shadow-xl border border-white/50 mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="SWARA Logo" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[#214365] tracking-tight mb-1">
            SWARA
          </h1>
          
          {!showOptions ? (
            <div className="h-6 overflow-hidden text-center mt-2">
              <p className="text-lg text-slate-600 font-medium animate-pulse transition-opacity duration-200">
                {languages[currentLang]}
              </p>
            </div>
          ) : (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-slate-600 text-xs md:text-sm font-medium tracking-wide">
                Survivor Wellness, Assessment & Rehabilitation
              </p>
              <p className="mt-3 md:mt-4 text-[#5b7a8a] text-xs md:text-sm italic font-serif opacity-90 max-w-sm mx-auto">
                Healing is not a destination,<br/>it's a journey — and you're not alone.
              </p>
            </div>
          )}
        </div>

        {/* Login Options (Glassmorphism Cards) */}
        {showOptions && (
          <div className="w-full mt-6 md:mt-8 flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 max-h-full">
            
            {/* User Login Card */}
            <div className="flex-1 max-w-[320px] w-full mx-auto bg-[#e6fbef]/40 hover:bg-[#e6fbef]/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl"></div>
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-50 to-teal-100 border-2 border-white/80 shadow-inner flex items-center justify-center mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 z-10">
                <div className="absolute inset-0 bg-white/20"></div>
                <User className="w-8 h-8 text-[#2c757c] relative z-10" />
              </div>
              <h2 className="text-lg font-bold text-[#1f2937] mb-2 z-10">User Login</h2>
              <p className="text-xs text-[#4b5563] mb-6 leading-relaxed px-2 flex-1 z-10">
                Access your wellbeing dashboard, track progress and get support.
              </p>
              <Link to="/auth/survivor" className="w-full z-10">
                <button className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-semibold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-xl">
                  Login as User <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>

            {/* Professional Login Card */}
            <div className="flex-1 max-w-[320px] w-full mx-auto bg-[#eef4ff]/40 hover:bg-[#eef4ff]/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 left-0 -ml-8 -mt-8 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl"></div>

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-white/80 shadow-inner flex items-center justify-center mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 z-10">
                <div className="absolute inset-0 bg-white/20"></div>
                <Stethoscope className="w-8 h-8 text-[#3b82f6] relative z-10" />
              </div>
              <h2 className="text-lg font-bold text-[#1f2937] mb-2 z-10">Professional Login</h2>
              <p className="text-xs text-[#4b5563] mb-6 leading-relaxed px-2 flex-1 z-10">
                For psychologists, counsellors and authorised professionals.
              </p>
              <Link to="/auth/professional" className="w-full z-10">
                <button className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-semibold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group-hover:shadow-xl">
                  Login as Professional <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>

          </div>
        )}

        {/* Footer */}
        {showOptions && (
          <div className="mt-6 md:mt-8 text-center animate-in fade-in duration-1000 delay-500 w-full relative z-10">
            <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-400 mb-3 uppercase tracking-widest">
              <div className="h-px bg-slate-300/50 w-12"></div>
              <span>OR</span>
              <div className="h-px bg-slate-300/50 w-12"></div>
            </div>
            <p className="text-[10px] text-slate-500/80">
              By continuing, you agree to our <a href="#" className="underline text-slate-500 hover:text-slate-700">Terms of Service</a> and <a href="#" className="underline text-slate-500 hover:text-slate-700">Privacy Policy</a>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
"""

with open(welcome_file, "w") as f:
    f.write(new_content)

print("Welcome screen modified for size and glassmorphism.")
