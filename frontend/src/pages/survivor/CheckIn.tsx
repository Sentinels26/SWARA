import { useState, useEffect } from 'react';
import { Home, ClipboardCheck, MessageCircle, User, Activity, Check, ArrowLeft, ArrowRight, Smile } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SurvivorSidebar } from '../../components/SurvivorSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function CheckIn() {
  // ───── All hooks at the top level — no conditional hooks ─────
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // UI Wizard State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedSleep, setSelectedSleep] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const totalSteps = 4; // Mood, Sleep, Energy, Notes

  useEffect(() => {
    api.get(`/cases/`).then((res: any) => {
      if (res.data.length > 0) {
        api.get(`/cases/detail/${res.data[0].id}`).then((detailRes) => {
          const checkins = detailRes.data.checkins || [];
          const today = new Date().toISOString().split('T')[0];
          const hasCheckedIn = checkins.some((c: any) => c.date && c.date.startsWith(today));
          setAlreadyCheckedIn(hasCheckedIn);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const steps = [
    { id: 1, name: 'Mood' },
    { id: 2, name: 'Sleep' },
    { id: 3, name: 'Energy' },
    { id: 4, name: 'Notes' }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitCheckin();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/survivor/dashboard');
    }
  };
  
  const submitCheckin = async () => {
    setIsSubmitting(true);
    try {
      const mappedDistress = selectedMood === 1 ? 1 : selectedMood === 2 ? 3 : selectedMood === 3 ? 5 : selectedMood === 4 ? 8 : selectedMood === 5 ? 10 : 5;
      const mappedSleep = selectedSleep === 1 ? 1 : selectedSleep === 2 ? 3 : selectedSleep === 3 ? 5 : selectedSleep === 4 ? 8 : selectedSleep === 5 ? 10 : 5;
      const mappedActivity = selectedEnergy === 1 ? 1 : selectedEnergy === 2 ? 3 : selectedEnergy === 3 ? 5 : selectedEnergy === 4 ? 8 : selectedEnergy === 5 ? 10 : 5;

      let priority = 'STABLE';
      if (mappedDistress > 8 || mappedSleep < 3) priority = 'HIGH PRIORITY';
      else if (mappedDistress > 6 || mappedSleep < 5) priority = 'ELEVATED';
      else if (mappedActivity < 3) priority = 'OBSERVE';

      await api.post(`/checkins/`, {
        distress_level: mappedDistress,
        sleep_quality: mappedSleep,
        activity_level: mappedActivity,
        support_priority: priority
      });

      if (user) {
        updateUser({ check_in_streak: (user.check_in_streak || 0) + 1 });
      }
      setIsComplete(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFaces = (selected: number | null, onSelect: (val: number) => void) => {
    const options = [
      { val: 5, label: 'Very Low', color: 'bg-[#ffebef]', hover: 'hover:bg-[#ffdee5]', icon: '😫', tint: 'from-pink-100 to-rose-100' },
      { val: 4, label: 'Low', color: 'bg-[#fff0e5]', hover: 'hover:bg-[#ffe3cc]', icon: '🙁', tint: 'from-orange-50 to-orange-100' },
      { val: 3, label: 'Okay', color: 'bg-[#fff8d6]', hover: 'hover:bg-[#ffefb3]', icon: '😐', tint: 'from-yellow-50 to-yellow-100' },
      { val: 2, label: 'Good', color: 'bg-[#e5fcf3]', hover: 'hover:bg-[#ccf7e6]', icon: '🙂', tint: 'from-green-50 to-emerald-100' },
      { val: 1, label: 'Great', color: 'bg-[#e5f4ff]', hover: 'hover:bg-[#cceaff]', icon: '😄', tint: 'from-blue-50 to-blue-100' },
    ];

    return (
      <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-6 w-full">
        {options.map(opt => (
          <button
            key={opt.val}
            onClick={() => onSelect(opt.val)}
            className={`flex flex-col items-center justify-center w-20 h-24 md:w-24 md:h-28 rounded-[2rem] transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.04)]
              ${selected === opt.val ? `ring-2 ring-offset-2 ring-offset-white/50 ring-[#2c757c] shadow-lg scale-105 bg-gradient-to-br ${opt.tint}` : `bg-white/60 hover:bg-white/80 border border-white`}
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${opt.tint} opacity-30`}></div>
            <div className="text-3xl md:text-4xl mb-2 md:mb-3 relative z-10 filter drop-shadow-sm">{opt.icon}</div>
            <div className={`text-xs font-bold relative z-10 ${selected === opt.val ? 'text-[#1f2937]' : 'text-slate-500'}`}>{opt.label}</div>
          </button>
        ))}
      </div>
    );
  };

  const renderCompleted = () => (
    <div className="flex flex-col items-center justify-center py-16 w-full max-w-md mx-auto animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-teal-50 to-[#e8f4f6] border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20"></div>
        <Check className="w-10 h-10 text-[#2c757c] relative z-10" strokeWidth={3} />
      </div>

      <h2 className="text-3xl font-bold text-[#1f2937] mb-3 text-center tracking-tight">Check-in Complete!</h2>
      <p className="text-[#4b5563] mb-10 text-center leading-relaxed text-sm">
        Your response has been recorded. <br/>
        Your next check-in will be available tomorrow.
      </p>

      <div className="w-full h-px bg-white/40 mb-10"></div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <button onClick={() => navigate('/survivor/dashboard')} className="flex-1 w-full py-4 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-bold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center">
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans relative" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Decorative background blurs */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0"></div>
      
      {/* Sidebar */}
      <SurvivorSidebar onOpenSos={() => {}} hasCheckedInToday={alreadyCheckedIn} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative z-10 p-4 md:p-8 items-center justify-center">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 w-full flex items-center justify-between px-4 pb-4 pt-4 bg-white/40 backdrop-blur-xl border-b border-white/60 z-20 shadow-sm">
          <div className="flex items-center gap-2">
             <img src="/logo.png" alt="SWARA" className="w-6 h-6 rounded-md" />
             <span className="font-bold text-[#1f2937] tracking-wider text-xs">SWARA</span>
          </div>
        </header>

        <div className="w-full max-w-4xl pt-6 md:pt-0 flex flex-col items-center">
          
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 font-medium bg-white/40 backdrop-blur-xl rounded-[2rem] p-8">Loading...</div>
          ) : alreadyCheckedIn ? (
            <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 p-10 text-center flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] animate-in fade-in duration-300">
              <ClipboardCheck className="w-16 h-16 text-[#2c757c] mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-[#1f2937] mb-2">You've already checked in today!</h2>
              <p className="text-[#4b5563] mb-8 max-w-md mx-auto text-sm">
                Thank you for logging your response. SWARA is analyzing your journey. Please come back tomorrow for your next check-in.
              </p>
              <button onClick={() => navigate('/survivor/dashboard')} className="w-full max-w-xs py-3.5 px-6 rounded-full bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white font-bold text-sm shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center">
                Back to Dashboard
              </button>
            </div>
          ) : isComplete ? (
            <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
              {renderCompleted()}
            </div>
          ) : (
            <div className="w-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col">
              
              {/* Header inside card */}
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#1f2937] mb-2">Daily Check-in</h1>
                  <p className="text-sm font-medium text-[#4b5563]">
                    Take a moment to check in with yourself.<br/>
                    <span className="opacity-80">Your feelings matter. This helps us understand how you are doing.</span>
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                   <div className="text-xs font-bold text-[#2c757c] bg-white/60 px-3 py-1.5 rounded-full border border-white">Step {step} of {totalSteps}</div>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              <div className="relative mb-10 w-full max-w-2xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/60 -translate-y-1/2 z-0 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-[#2c757c] -translate-y-1/2 z-0 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
                
                <div className="flex justify-between relative z-10">
                  {steps.map(s => (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                        step > s.id ? 'bg-[#2c757c] text-white ring-2 ring-white' : 
                        step === s.id ? 'bg-[#2c757c] text-white ring-4 ring-teal-100 scale-110' : 
                        'bg-white text-slate-400 border border-slate-200'
                      }`}>
                        {s.id}
                      </div>
                      <span className={`text-[10px] font-bold ${step >= s.id ? 'text-[#1f2937]' : 'text-slate-400'}`}>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white/60 p-6 md:p-8 shadow-[inset_0_2px_10px_rgba(255,255,255,1)] relative overflow-hidden">
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="shrink-0 flex justify-center md:justify-start">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20"></div>
                        <Smile className="w-10 h-10 text-[#2c757c] relative z-10" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-1 text-center md:text-left">How are you feeling right now?</h2>
                      <p className="text-[#6b7280] text-sm text-center md:text-left mb-4">Select the option that best describes your current mood.</p>
                      {renderFaces(selectedMood, setSelectedMood)}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="shrink-0 flex justify-center md:justify-start">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20"></div>
                        <div className="text-4xl relative z-10 filter drop-shadow-sm">💤</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-1 text-center md:text-left">How was your sleep last night?</h2>
                      <p className="text-[#6b7280] text-sm text-center md:text-left mb-4">Select the option that best describes your sleep quality.</p>
                      {renderFaces(selectedSleep, setSelectedSleep)}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="shrink-0 flex justify-center md:justify-start">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20"></div>
                        <Activity className="w-10 h-10 text-orange-500 relative z-10" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-1 text-center md:text-left">How is your energy level?</h2>
                      <p className="text-[#6b7280] text-sm text-center md:text-left mb-4">Select the option that reflects your physical activity and energy.</p>
                      {renderFaces(selectedEnergy, setSelectedEnergy)}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 md:items-start">
                    <div className="shrink-0 flex justify-center md:justify-start">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-white shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20"></div>
                        <div className="text-4xl relative z-10 filter drop-shadow-sm">📝</div>
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <h2 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-1 text-center md:text-left">Anything else to add?</h2>
                      <p className="text-[#6b7280] text-sm text-center md:text-left mb-4">Feel free to write any additional notes about your day. (Optional)</p>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="I felt anxious around noon but deep breathing helped..."
                        className="w-full h-32 md:h-40 p-5 rounded-2xl border border-white bg-white/60 backdrop-blur-sm focus:outline-none focus:border-[#2c757c]/50 focus:bg-white/80 focus:ring-2 focus:ring-[#2c757c]/20 resize-none text-sm text-slate-800 shadow-inner"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav */}
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 rounded-full px-6 py-3 border border-slate-300/40 bg-transparent hover:bg-white/40 text-slate-600 font-semibold text-sm transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !selectedMood) || 
                    (step === 2 && !selectedSleep) || 
                    (step === 3 && !selectedEnergy) ||
                    isSubmitting
                  }
                  className="w-32 bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white rounded-full py-3 shadow-lg shadow-teal-900/20 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none text-sm"
                >
                  {isSubmitting ? 'Saving...' : step === totalSteps ? 'Finish' : 'Next'}
                  {!isSubmitting && step < totalSteps && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/60 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400">
          <Home className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/check-in" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <ClipboardCheck className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400">
          <Activity className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/chat" className="flex flex-col items-center gap-1.5 text-slate-400">
          <MessageCircle className="w-5 h-5"/>
        </Link>
        <Link to="/survivor/profile" className="flex flex-col items-center gap-1.5 text-slate-400">
          <User className="w-5 h-5"/>
        </Link>
      </nav>

    </div>
  );
}
