import os
import re

welcome_path = "/Users/macbookair/Documents/swara1/frontend/src/pages/welcome/Welcome.tsx"

new_code = """import { useState, useEffect, MouseEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope, ArrowRight } from 'lucide-react';
import Snowfall from '../../components/Snowfall';

const languages = [
  'English', 'हिंदी', 'বাংলা', 'ગુજરાતી', 'ಕನ್ನಡ', 
  'മലയാളം', 'मराठी', 'ଓଡ଼ିଆ', 'ਪੰਜਾਬੀ', 'தமிழ்', 'తెలుగు', 'اردو'
];

// Helper component for 3D Tilt Card
const TiltCard = ({ 
  children, 
  className, 
  to, 
  navigatingTo, 
  setNavigatingTo 
}: { 
  children: React.ReactNode, 
  className: string, 
  to: string,
  navigatingTo: string | null,
  setNavigatingTo: (to: string) => void
}) => {
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isSelected = navigatingTo === to;
  const isOtherSelected = navigatingTo !== null && navigatingTo !== to;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || navigatingTo) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-3 to 3 degrees)
    const rotateY = ((x / rect.width) - 0.5) * 6; 
    const rotateX = ((y / rect.height) - 0.5) * -6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    if (navigatingTo) return;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`,
      transition: 'transform 0.6s var(--ease-swara)'
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigatingTo) return;
    setNavigatingTo(to);
    
    setTiltStyle({
      transform: `perspective(1000px) scale(15)`,
      filter: 'blur(15px)',
      opacity: 0,
      transition: 'transform 0.6s cubic-bezier(0.7, 0, 0.2, 1), filter 0.5s ease-in, opacity 0.3s ease-in 0.3s',
      zIndex: 9999
    });
    
    setTimeout(() => {
      navigate(to);
    }, 550);
  };

  if (isOtherSelected) {
    return (
      <div className={`${className} opacity-0 transition-none scale-95 pointer-events-none duration-0`}>
        {children}
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`swara-card swara-card-interactive cursor-pointer ${className} ${isSelected ? 'pointer-events-none' : ''}`}
      style={tiltStyle}
    >
      {children}
    </div>
  );
};

export default function Welcome() {
  const [currentLang, setCurrentLang] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
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
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans swara-bg-ambient animate-page-load">
      
      {/* Increased snowfall intensity */}
      <Snowfall count={250} minSpeed={0.8} maxSpeed={2.5}>
      <div className={`relative z-10 transition-all duration-1000 ease-in-out flex flex-col items-center w-full max-w-4xl h-full justify-center max-h-screen py-4`}>
        
        {/* Logo and Header */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-in-out ${showOptions ? 'transform -translate-y-2' : ''} ${navigatingTo ? 'opacity-0 scale-95 transition-all duration-500' : ''}`}>
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

        {/* Login Options (3D Tilt Glass Cards) */}
        {showOptions && (
          <div className="w-full mt-6 md:mt-8 flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 max-h-full">
            
            <TiltCard to="/auth/survivor" navigatingTo={navigatingTo} setNavigatingTo={setNavigatingTo} className="flex-1 max-w-[320px] w-full mx-auto p-6 flex flex-col items-center text-center group">
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
              <div className="w-full z-10 pointer-events-none">
                <button className="swara-btn-blob w-full text-sm">
                  Login as User <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>

            <TiltCard to="/auth/professional" navigatingTo={navigatingTo} setNavigatingTo={setNavigatingTo} className="flex-1 max-w-[320px] w-full mx-auto p-6 flex flex-col items-center text-center group">
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
              <div className="w-full z-10 pointer-events-none">
                <button className="swara-btn-blob blob-blue w-full text-sm">
                  Login as Professional <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>

          </div>
        )}

        {/* Footer */}
        {showOptions && (
          <div className={`mt-6 md:mt-8 text-center animate-in fade-in duration-1000 delay-500 w-full relative z-10 ${navigatingTo ? 'opacity-0 transition-opacity duration-300' : ''}`}>
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
      </Snowfall>
    </div>
  );
}
"""

with open(welcome_path, "w") as f:
    f.write(new_code)

print("Updated welcome with instant hide, smoother animation, and thicker snow.")
