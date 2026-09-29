// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Bell, Lock, Key, Home as HomeIcon, Users, 
    ShieldAlert, Calendar, FileText, BookOpen, Activity, 
    Settings, User, Menu, X, ChevronRight, SlidersHorizontal, 
    Globe, Palette, ShieldCheck, Mail, Smartphone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ProfessionalSettings() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-slate-50 transition-colors duration-300" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
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
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 overflow-x-hidden relative z-10">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 font-medium rounded-lg transition-colors w-full whitespace-nowrap text-left" />
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto pb-24 md:pb-4 relative">
        <div className="w-full max-w-4xl mx-auto p-4 md:p-10 mt-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-page-load">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3 animate-page-load">
                        {/* Mobile back button, Desktop settings icon */}
                        <button onClick={() => navigate(-1)} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <Settings className="hidden md:block w-7 h-7 text-[#2c757c]" />
                        Settings
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-medium md:ml-10 animate-page-load-stagger-1">Configure your portal preferences.</p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-green-50/50 text-green-700 rounded-full text-sm font-bold border border-green-100 animate-page-load-stagger-2">
                    <ShieldCheck className="w-4 h-4" /> Secure & Encrypted
                </div>
            </div>

            {/* Tabs (Responsive) */}
            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200/50 mb-6 w-full -mx-4 px-4 md:mx-0 md:px-0 animate-page-load-stagger-1">
                {['General', 'Notifications', 'Security', 'Account'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 text-sm font-bold whitespace-nowrap transition-colors
                            ${activeTab === tab 
                                ? 'text-[#2c757c] md:border-b-2 md:border-[#2c757c] bg-[#2c757c] md:bg-transparent text-white md:text-[#2c757c] px-4 md:px-0 rounded-full md:rounded-none' 
                                : 'text-slate-500 hover:text-slate-700 px-4 md:px-0'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="animate-page-load-stagger-2">
                {activeTab === 'General' && (
                    <>
                    {/* General Settings Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-slate-50 bg-slate-50/30 flex items-start gap-4">
                            <SlidersHorizontal className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                            <div>
                                <h2 className="font-bold text-slate-800 text-sm md:text-base mb-1">General Preferences</h2>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">Fine-tune your experience with advanced options.</p>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            <div className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer ml-2 md:ml-4 mr-2 md:mr-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm mb-0.5">Language & Region</h3>
                                        <p className="text-slate-500 text-xs font-medium">English (IN)</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#2c757c]" />
                            </div>

                            <div 
                              className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer ml-2 md:ml-4 mr-2 md:mr-4"
                              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                        <Palette className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm mb-0.5">Appearance</h3>
                                        <p className="text-slate-500 text-xs font-medium">{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#2c757c]">{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                                  <ChevronRight className="w-4 h-4 text-[#2c757c]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {activeTab === 'Notifications' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setPushEnabled(!pushEnabled)}>
                                <div className="flex gap-4 md:gap-5 items-start">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${pushEnabled ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-400'}`}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Push Notifications</h3>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium pr-8">Manage push notifications for urgent alerts.</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${pushEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${pushEnabled ? 'left-5' : 'left-0.5'}`}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setEmailEnabled(!emailEnabled)}>
                                <div className="flex gap-4 md:gap-5 items-start">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${emailEnabled ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Email Summaries</h3>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium pr-8">Weekly case reports sent to your email.</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${emailEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${emailEnabled ? 'left-5' : 'left-0.5'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Security' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setTwoFaEnabled(!twoFaEnabled)}>
                                <div className="flex gap-4 md:gap-5 items-start">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${twoFaEnabled ? 'bg-purple-50 text-purple-500' : 'bg-slate-100 text-slate-400'}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Security & 2FA</h3>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium pr-8">{twoFaEnabled ? 'Two-factor authentication is currently enabled.' : 'Enable Two-factor authentication for extra security.'}</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${twoFaEnabled ? 'bg-purple-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${twoFaEnabled ? 'left-5' : 'left-0.5'}`}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <div className="flex gap-4 md:gap-5 items-start">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Change Password</h3>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium pr-8">Update your login credentials.</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2c757c] hover:bg-teal-50 px-3 py-1.5 rounded-full transition-colors">
                                    Update <ChevronRight className="w-4 h-4" />
                                </div>
                                <div className="md:hidden absolute right-6 mt-4"><ChevronRight className="w-4 h-4 text-slate-400" /></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Account' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate('/professional/profile')}>
                                <div className="flex gap-4 md:gap-5 items-start">
                                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Profile Details</h3>
                                        <p className="text-slate-500 text-xs md:text-sm font-medium pr-8">Update your personal information and contact details.</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2c757c] hover:bg-teal-50 px-3 py-1.5 rounded-full transition-colors">
                                    Edit <ChevronRight className="w-4 h-4" />
                                </div>
                                <div className="md:hidden absolute right-6 mt-4"><ChevronRight className="w-4 h-4 text-slate-400" /></div>
                            </div>
                        </div>
                    </div>
                )}
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
        <Link to="/professional/alerts" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600 relative">
          <div className="relative">
            <Bell className="w-5 h-5"/>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <User className="w-5 h-5"/>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
