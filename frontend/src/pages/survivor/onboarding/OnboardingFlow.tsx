import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Shield, Lock, UserCheck, Settings, ArrowRight, User, Calendar, Heart } from 'lucide-react';
import api from '../../../api';

export default function OnboardingFlow() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Determine starting step based on backend state
  const getInitialStep = () => {
    if (!user) return 0;
    if (!user.consent_completed) return 0; // Welcome + Consent
    if (!user.permissions_reviewed) return 1; // Permissions
    if (!user.profile_completed) return 2; // Profile
    return 0; // fallback
  };

  const [step, setStep] = useState(getInitialStep());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states for profile
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [dob, setDob] = useState('');

  const saveState = async (updates: any) => {
    setIsSubmitting(true);
    try {
      await api.put('/api/auth/me/profile', updates);
      updateUser(updates);
    } catch (err) {
      console.error('Failed to save onboarding state', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeWelcomeAndConsent = async () => {
    await saveState({ consent_completed: true });
    setStep(1);
  };

  const completePermissions = async () => {
    await saveState({ permissions_reviewed: true });
    setStep(2);
  };

  const completeProfile = async () => {
    await saveState({ 
        profile_completed: true, 
        onboarding_completed: true,
        full_name: fullName,
        nickname: nickname
        // dob omitted as it might need specific schema support, but we capture it in UI
    });
    navigate('/survivor/dashboard');
  };

  const renderTopBar = (_currentStep: number) => (
    <div className="w-full flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-20">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="SWARA" className="w-6 h-6 rounded-md" />
        <span className="font-bold text-slate-800 tracking-wider text-sm">SWARA</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Shield className="w-3.5 h-3.5 text-[#2c757c]" />
        Secure & Encrypted
      </div>
    </div>
  );

  const renderStepIndicator = (currentStep: number) => (
    <div className="absolute top-6 right-6 z-20 hidden md:flex flex-col items-end">
      <div className="text-xs font-bold text-[#2c757c] mb-1">Step {currentStep + 1} of 3</div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-[#2c757c]' : i < currentStep ? 'bg-[#2c757c]/60' : 'bg-[#2c757c]/20'}`}></div>
        ))}
      </div>
    </div>
  );
  
  const renderMobileStepIndicator = (currentStep: number) => (
    <div className="md:hidden flex flex-col items-center mb-6">
      <div className="text-xs font-bold text-[#2c757c] mb-1">Step {currentStep + 1} of 3</div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-[#2c757c]' : i < currentStep ? 'bg-[#2c757c]/60' : 'bg-[#2c757c]/20'}`}></div>
        ))}
      </div>
    </div>
  );

  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>
        {renderTopBar(0)}
        
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {renderMobileStepIndicator(0)}
          {renderStepIndicator(0)}
          
          <div className="text-center mb-6 md:mb-8 mt-12 md:mt-0">
            <h1 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-2 tracking-tight">1. Welcome to SWARA</h1>
            <p className="text-[#4b5563] text-sm font-medium">A safe space for your healing journey.</p>
          </div>

          <div className="w-full bg-white/40 hover:bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-50 to-[#e8f4f6] border-2 border-white shadow-inner flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-[#2c757c]/10 scale-110"></div>
              <Heart className="w-10 h-10 text-[#2c757c]" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1f2937] mb-3 text-center">Your Safe Space</h2>
            <p className="text-sm text-[#4b5563] text-center mb-8 leading-relaxed max-w-sm">
              SWARA provides tools for tracking wellbeing and secure communication with your professional. 
              <br/><br/>
              <span className="font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg inline-block">
                Not an emergency system. Call local authorities for immediate danger.
              </span>
            </p>

            <button onClick={completeWelcomeAndConsent} disabled={isSubmitting} className="w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-bold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? 'Saving...' : 'I Understand & Consent'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>
        {renderTopBar(1)}
        
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {renderMobileStepIndicator(1)}
          {renderStepIndicator(1)}

          <div className="text-center mb-6 md:mb-8 mt-12 md:mt-0">
            <h1 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-2 tracking-tight">2. Permissions & Privacy</h1>
            <p className="text-[#4b5563] text-sm font-medium">Your data. Your choice. Transparent, secure and in your control.</p>
          </div>

          <div className="w-full bg-white/40 hover:bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-white shadow-inner flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-blue-500/10 scale-110"></div>
              <Shield className="w-10 h-10 text-blue-500 fill-blue-100" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1f2937] mb-2 text-center">Permissions & Privacy</h2>
            <p className="text-sm text-[#4b5563] text-center mb-8 leading-relaxed max-w-sm">
              Your privacy is our priority. Please review how we handle your data and give your consent to continue.
            </p>

            <div className="w-full space-y-3 mb-8">
              <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1f2937] text-sm">Data Encryption</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed mt-0.5">All your data is encrypted and securely stored.</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2c757c] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1f2937] text-sm">Professional Access</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed mt-0.5">Only assigned professionals can view your information.</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1f2937] text-sm">AI Features</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed mt-0.5">You can opt-out of AI processing later in Settings.</div>
                </div>
              </div>
            </div>

            <button onClick={completePermissions} disabled={isSubmitting} className="w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-bold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? 'Saving...' : 'Accept & Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0"></div>
        {renderTopBar(2)}
        
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {renderMobileStepIndicator(2)}
          {renderStepIndicator(2)}

          <div className="text-center mb-6 md:mb-8 mt-12 md:mt-0">
            <h1 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-2 tracking-tight">3. Profile Setup</h1>
            <p className="text-[#4b5563] text-sm font-medium">A little setup goes a long way. Personalise your experience for better support.</p>
          </div>

          <div className="w-full bg-white/40 hover:bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 border-2 border-white shadow-inner flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 rounded-full border border-blue-500/10 scale-110"></div>
              <img src="/user.jpeg" alt="Profile" className="w-full h-full object-cover opacity-80" />
            </div>
            
            <h2 className="text-xl font-bold text-[#1f2937] mb-2 text-center">Profile Setup</h2>
            <p className="text-sm text-[#4b5563] text-center mb-8 leading-relaxed max-w-sm">
              You're almost there! Let's set up your profile.
            </p>

            <div className="w-full space-y-4 mb-8 text-left">
              
              <div className="bg-white/60 rounded-2xl border border-white/40 shadow-sm overflow-hidden flex flex-col justify-center px-4 py-2 hover:bg-white/80 transition-colors focus-within:ring-2 focus-within:ring-[#2c757c]/50">
                <div className="flex items-center gap-3 w-full">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 p-0 h-6"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-2xl border border-white/40 shadow-sm overflow-hidden flex flex-col justify-center px-4 py-2 hover:bg-white/80 transition-colors focus-within:ring-2 focus-within:ring-[#2c757c]/50">
                <div className="flex items-center gap-3 w-full">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nickname (optional)</label>
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter a nickname" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 p-0 h-6"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-2xl border border-white/40 shadow-sm overflow-hidden flex flex-col justify-center px-4 py-2 hover:bg-white/80 transition-colors focus-within:ring-2 focus-within:ring-[#2c757c]/50">
                <div className="flex items-center gap-3 w-full">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Date of Birth</label>
                    <input 
                      type="date" 
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 p-0 h-6 text-slate-400"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button onClick={completeProfile} disabled={isSubmitting} className="w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-bold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? 'Finishing...' : 'Next'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
