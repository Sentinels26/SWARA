// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon, Users, ShieldAlert, Calendar, FileText, BookOpen, Activity, Settings, User, Menu, X, Phone, FileText as FileTextIcon, Info, Send } from 'lucide-react';
import api from '../../api';

export default function ProfessionalReferral() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/referrals/');
      setToken(res.data.token);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-100 flex-col sticky top-0 h-screen hidden md:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} shrink-0 z-50 relative overflow-hidden`}>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url(/user.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }}></div>
        
        <div className="flex items-center justify-between p-6 relative z-10">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
            <div className="font-bold text-xl text-slate-800 tracking-wider">SWARA</div>
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute right-4 top-8 text-slate-400 hover:text-slate-600 transition-colors z-20">
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-4 flex flex-col gap-1 overflow-x-hidden relative z-10">
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Main</div>}
          <Link to="/professional/dashboard" title="Home" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><HomeIcon className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Home'}</Link>
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 overflow-x-hidden relative z-10">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 font-medium rounded-lg transition-colors w-full whitespace-nowrap text-left" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto pb-24 md:pb-8">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-10 mt-2 md:mt-2 relative">
          
          <button onClick={() => navigate('/professional/cases')} className="flex items-center gap-2 text-[#2c757c] font-bold mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Cases
          </button>
          
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
            <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-3 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">New Survivor Referral</h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f4f6] text-[#2c757c] rounded-full text-xs font-bold self-end md:self-auto">
                    <ShieldAlert className="w-3.5 h-3.5" /> Confidential & Secure
                </div>
            </div>
            <p className="text-slate-500 mb-8 md:mb-10 text-sm md:text-base max-w-lg font-medium leading-relaxed">
                Help us collect the right information to ensure timely support and safety for the survivor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* First Name */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-5 h-5"/>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-slate-700">First Name *</label>
                            <input id="input_c360d4c2" name="input_c360d4c2" required placeholder="e.g. Jane" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2c757c] focus:ring-1 focus:ring-[#2c757c] shadow-sm" />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-5 h-5"/>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Last Name / Initial *</label>
                            <input id="input_b48d5e4e" name="input_b48d5e4e" required placeholder="e.g. D." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2c757c] focus:ring-1 focus:ring-[#2c757c] shadow-sm" />
                        </div>
                    </div>
                </div>

                {/* Contact Method */}
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-5 h-5"/>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Contact Method (Optional for Demo)</label>
                        <input id="input_7f518bab" name="input_7f518bab" placeholder="Email or Phone number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2c757c] focus:ring-1 focus:ring-[#2c757c] shadow-sm" />
                    </div>
                </div>

                {/* Notes */}
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileTextIcon className="w-5 h-5"/>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Primary Context / Notes *</label>
                        <div className="relative">
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                maxLength={1000}
                                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c] focus:ring-1 focus:ring-[#2c757c] resize-none text-sm font-medium shadow-sm"
                                placeholder="Include relevant background information for the wellbeing journey..."
                                required
                            />
                            <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400">
                                {notes.length}/1000
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-[#e8f4f6] p-5 rounded-2xl flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#2c757c] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-4 h-4"/>
                    </div>
                    <p className="text-sm font-medium text-[#2c757c] leading-relaxed">
                        Submitting this referral will generate a secure onboarding link for the survivor. They must complete the consent flow before any data is collected.
                    </p>
                </div>

                {token && (
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-200 mt-4 flex gap-4 items-start animate-in fade-in zoom-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 mb-1">Referral Generated Successfully!</h4>
                        <p className="text-sm font-medium text-green-700 mb-3">Share this exact token with the survivor for registration:</p>
                        <code className="bg-white px-4 py-2 rounded-xl block text-center text-xl font-mono font-bold border border-green-200 text-slate-800 tracking-wider shadow-sm">{token}</code>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between items-center pt-2">
                    <button type="button" onClick={() => navigate('/professional/cases')} className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm text-sm">
                        {token ? 'Done' : 'Cancel'}
                    </button>
                    {!token && (
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-[#2c757c] hover:bg-[#1f595e] rounded-full transition-colors shadow-sm disabled:opacity-50 text-sm">
                            <Send className="w-4 h-4"/> {isSubmitting ? 'Generating...' : 'Create Referral'}
                        </button>
                    )}
                </div>
            </form>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
        <Link to="/professional/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <HomeIcon className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/professional/cases" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Users className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Cases</span>
        </Link>
        <Link to="/professional/appointments" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Calendar className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Calendar</span>
        </Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Menu className="w-5 h-5"/>
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>

    </div>
  );
}

