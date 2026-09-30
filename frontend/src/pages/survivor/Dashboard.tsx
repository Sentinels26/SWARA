import { useState, useEffect } from 'react';
import { Home, MessageCircle, HeartPulse, User, Bell, ChevronRight, Activity, AlertTriangle, Phone, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SurvivorSidebar } from '../../components/SurvivorSidebar';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import api from '../../api';
import { PlantConsistency } from '../../components/PlantConsistency';
import { LogoutButton } from '../../components/LogoutButton';

export default function SurvivorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  void t;
  const navigate = useNavigate();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState('');
  // No caseData needed
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'SURVIVOR') {
      api.get(`/api/cases/`).then(res => {
        if (res.data.length > 0) {
          const activeCase = res.data[0];
          api.get(`/api/checkins/${activeCase.id}`).then(cRes => {
            setCheckins(cRes.data);
          });
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const hasCheckedInToday = checkins.length > 0 && new Date(checkins[0].timestamp).toDateString() === new Date().toDateString();

  const triggerSOS = async (type: string) => {
    try {
      await api.post('/api/alerts/trigger_sos/');
      setSosStatus(`Alerting ${type}...`);
      setTimeout(() => { setIsSosOpen(false); setSosStatus(''); }, 4000);
    } catch (err) {
      console.error(err);
      setSosStatus('Failed to send SOS.');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row pb-20 md:pb-0 font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 w-full flex items-center justify-between px-4 pb-4 pt-4 bg-white/90 backdrop-blur-xl border-b border-white/60 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md" />
          <span className="font-bold text-lg text-slate-800 tracking-wide">SWARA</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400"><Bell className="w-5 h-5"/></button>
          <LogoutButton className="text-slate-400 hover:text-slate-600" showText={false} />
          <button onClick={() => setIsSosOpen(true)} className="px-3 py-1 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 rounded-full transition-colors border border-red-200">
            SOS
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <SurvivorSidebar onOpenSos={() => setIsSosOpen(true)} hasCheckedInToday={typeof hasCheckedInToday !== "undefined" ? hasCheckedInToday : false} />

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-10 pt-6 md:pt-10 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* Desktop Header */}
        <header className="hidden md:flex justify-end items-center mb-6 text-sm text-slate-500 gap-6">
          <span>{currentDate}</span>
          <button className="text-slate-400 hover:text-slate-600"><Bell className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.profile_picture_url ? <img src={user.profile_picture_url} className="w-full h-full object-cover"/> : (user?.nickname?.[0] || user?.full_name?.[0] || 'A').toUpperCase()}
          </div>
        </header>

        {/* Welcome Section */}
        <div className="mb-8 animate-page-load">
          <h1 className="text-[1.75rem] font-bold tracking-tight animated-gradient-text">Good morning, {user?.nickname || user?.full_name?.split(' ')[0] || 'Aisha'} ☀️</h1>
          <p className="text-[#6b7280] text-sm mt-1 animate-page-load-stagger-1">You're doing well. Take a moment for yourself today.</p>
        </div>
        
        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mb-8 animate-page-load-stagger-1">
          
          {/* Check-in Card */}
          <div className="md:col-span-3 bg-white rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 overflow-hidden relative">
            {/* Soft background shape */}
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#e8f4f6] rounded-full translate-x-12 translate-y-12 opacity-50 z-0"></div>
            
            <div className="relative z-10">
              <h3 className="text-[#374151] font-bold text-lg mb-1">Today's Check-in</h3>
              <p className="text-[#6b7280] text-sm mb-6">How are you feeling today?</p>
              
              {hasCheckedInToday ? (
                <div className="px-6 py-2.5 bg-[#f3f4f6] text-[#6b7280] rounded-full text-sm font-bold inline-block">Completed ✓</div>
              ) : (
                <Button onClick={() => navigate('/survivor/check-in')} className="swara-btn-blob px-6 py-2.5">Start Check-in</Button>
              )}
            </div>
            
            <div className="relative z-10 shrink-0 opacity-80">
              {/* Approximating the leafy graphic */}
              <div className="w-24 h-24 text-[#88c5cc]">
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" opacity="0.5"/>
                   <path d="M12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12C8 18 12 22 12 22Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Streak Card replaced with PlantConsistency */}
          <div className="md:col-span-2 flex">
            <PlantConsistency checkins={checkins} />
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-[1.05rem] font-bold text-[#374151] mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            <Link to="/survivor/chat" className="relative overflow-hidden bg-gradient-to-br from-[#eefafb] to-[#f4fbff] rounded-[1.5rem] p-6 border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group flex flex-col h-full min-h-[160px]">
              {/* Decorative Leaf Graphic */}
              <div className="absolute left-0 bottom-0 w-24 h-24 opacity-40 pointer-events-none transform -translate-x-4 translate-y-4">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#4ade80]">
                   <path d="M10,90 C10,90 30,70 50,70 C70,70 90,90 90,90 C90,90 70,110 50,110 C30,110 10,90 10,90 Z" opacity="0.6"/>
                   <path d="M10,90 C10,90 20,50 40,40 C60,30 80,40 80,40 C80,40 60,70 40,80 C20,90 10,90 10,90 Z"/>
                </svg>
              </div>
              
              <div className="flex items-start gap-4 relative z-10 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-100/50 border-2 border-white flex items-center justify-center text-teal-600 shrink-0 shadow-inner">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <div className="font-bold text-[#1f2937] mb-1">Talk to SWARA</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed">Chat anytime, get emotional support and guidance.</div>
                </div>
              </div>
              
              <div className="mt-auto flex justify-end relative z-10">
                <div className="w-8 h-8 rounded-full bg-teal-100/50 text-teal-600 flex items-center justify-center border border-white group-hover:bg-teal-200 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link to="/survivor/journey" className="relative overflow-hidden bg-gradient-to-br from-[#f3f0ff] to-[#f8f5ff] rounded-[1.5rem] p-6 border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group flex flex-col h-full min-h-[160px]">
              {/* Decorative Leaf Graphic */}
              <div className="absolute left-0 bottom-0 w-24 h-24 opacity-40 pointer-events-none transform -translate-x-4 translate-y-4">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#a78bfa]">
                   <path d="M10,90 C10,90 30,70 50,70 C70,70 90,90 90,90 C90,90 70,110 50,110 C30,110 10,90 10,90 Z" opacity="0.6"/>
                   <path d="M10,90 C10,90 20,50 40,40 C60,30 80,40 80,40 C80,40 60,70 40,80 C20,90 10,90 10,90 Z"/>
                </svg>
              </div>

              <div className="flex items-start gap-4 relative z-10 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100/50 border-2 border-white flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <div className="font-bold text-[#1f2937] mb-1">View Progress</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed">See your journey and mood trends.</div>
                </div>
              </div>
              
              <div className="mt-auto flex justify-end relative z-10">
                <div className="w-8 h-8 rounded-full bg-purple-100/50 text-purple-600 flex items-center justify-center border border-white group-hover:bg-purple-200 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link to="/survivor/support" className="relative overflow-hidden bg-gradient-to-br from-[#fff0f3] to-[#fff5f7] rounded-[1.5rem] p-6 border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group flex flex-col h-full min-h-[160px]">
              {/* Decorative Leaf Graphic */}
              <div className="absolute left-0 bottom-0 w-24 h-24 opacity-40 pointer-events-none transform -translate-x-4 translate-y-4">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#fb7185]">
                   <path d="M10,90 C10,90 30,70 50,70 C70,70 90,90 90,90 C90,90 70,110 50,110 C30,110 10,90 10,90 Z" opacity="0.6"/>
                   <path d="M10,90 C10,90 20,50 40,40 C60,30 80,40 80,40 C80,40 60,70 40,80 C20,90 10,90 10,90 Z"/>
                </svg>
              </div>

              <div className="flex items-start gap-4 relative z-10 mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-100/50 border-2 border-white flex items-center justify-center text-pink-600 shrink-0 shadow-inner">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <div className="font-bold text-[#1f2937] mb-1">Find Support</div>
                  <div className="text-xs text-[#6b7280] leading-relaxed">Connect with a professional when you need it.</div>
                </div>
              </div>
              
              <div className="mt-auto flex justify-end relative z-10">
                <div className="w-8 h-8 rounded-full bg-pink-100/50 text-pink-600 flex items-center justify-center border border-white group-hover:bg-pink-200 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Bottom Banner using requested user box image */}
        <div className="w-full h-32 md:h-40 rounded-3xl overflow-hidden relative shadow-[0_4px_15px_rgb(0,0,0,0.05)] bg-[#dbe8e8]">
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              backgroundImage: 'url(/userbox.jpeg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'bottom right',
              opacity: 0.9 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ebf5f5]/90 via-[#ebf5f5]/60 to-transparent z-0"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-10">
            <h3 className="text-[#1e464a] font-bold text-lg md:text-xl mb-1">You are not alone.</h3>
            <p className="text-[#3c787e] text-sm font-medium">Support is always within reach.</p>
          </div>
        </div>
        
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center p-3 px-6 z-10 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-[#2c757c]"><Home className="w-5 h-5"/><span className="text-[10px] font-bold">Home</span></Link>
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><Activity className="w-5 h-5"/><span className="text-[10px] font-medium">Journey</span></Link>
        <Link to="/survivor/support" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><HeartPulse className="w-5 h-5"/><span className="text-[10px] font-medium">Support</span></Link>
        <Link to="/survivor/profile" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><User className="w-5 h-5"/><span className="text-[10px] font-medium">Profile</span></Link>
      </nav>

      {/* SOS Modal (kept exactly as before functionality-wise) */}
      <Modal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} title="Emergency Support">
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-2 drop-shadow-md" />
            <h3 className="text-xl font-bold text-slate-900">Do you need immediate help?</h3>
            <p className="text-slate-600 text-sm mt-2">
              Bypass routine monitoring and connect with immediate support networks.
            </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => triggerSOS('Emergency Services (112)')} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200"><Phone className="w-5 h-5"/></div>
                <div>
                  <div className="font-bold text-red-700">Call Emergency Services</div>
                  <div className="text-xs text-red-600">Dial 112 directly</div>
                </div>
              </div>
            </button>
            <button onClick={() => triggerSOS('Care Team')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><Users className="w-5 h-5"/></div>
                <div>
                  <div className="font-bold text-slate-900">Alert My Care Team</div>
                  <div className="text-xs text-slate-500">Dr. Priya Sharma & staff</div>
                </div>
              </div>
            </button>
          </div>

          {sosStatus && (
            <div className="bg-slate-800 text-white p-3 rounded-lg text-sm text-center animate-in fade-in zoom-in font-medium">
              {sosStatus}
            </div>
          )}
          
          <Button variant="outline" className="w-full border-slate-300" onClick={() => setIsSosOpen(false)}>Cancel / Go Back</Button>
        </div>
      </Modal>

    </div>
  );
}
