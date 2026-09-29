// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Bell, ChevronLeft, Home as HomeIcon, Users, 
    ShieldAlert, Calendar, FileText, BookOpen, Activity, 
    Settings, User, Menu, X, Check, ChevronRight, Clock,
    RefreshCw
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

interface Alert {
  id: number;
  case_id: number;
  alert_type: string;
  message: string;
  is_read: boolean;
  timestamp: string;
}

export default function ProfessionalAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/alerts/`).then(res => setAlerts(res.data)).catch(err => console.error(err));
    }
  }, [user]);

  const getAlertConfig = (type: string, message: string) => {
      const t = (type || '').toUpperCase();
      const m = (message || '').toUpperCase();
      
      if (t.includes('SYSTEM') && !m.includes('MAINTENANCE')) return { 
          icon: Bell, bg: 'bg-red-50', iconColor: 'text-red-500', 
          category: 'System', catColor: 'text-red-400', 
          badge: 'High Priority', badgeBg: 'bg-red-50', badgeColor: 'text-red-600'
      };
      if (t.includes('APPOINTMENT')) return { 
          icon: Calendar, bg: 'bg-blue-50', iconColor: 'text-blue-500', 
          category: 'Appointments', catColor: 'text-blue-400', 
          badge: 'Reminder', badgeBg: 'bg-blue-50', badgeColor: 'text-blue-600'
      };
      if (t.includes('SAFETY')) return { 
          icon: ShieldAlert, bg: 'bg-green-50', iconColor: 'text-green-500', 
          category: 'Safety', catColor: 'text-green-400', 
          badge: 'Info', badgeBg: 'bg-green-50', badgeColor: 'text-green-600'
      };
      if (t.includes('REPORT') || m.includes('REPORT')) return { 
          icon: FileText, bg: 'bg-purple-50', iconColor: 'text-purple-500', 
          category: 'General', catColor: 'text-purple-400', 
          badge: 'Update', badgeBg: 'bg-purple-50', badgeColor: 'text-purple-600'
      };
      if (m.includes('MAINTENANCE')) return { 
          icon: Calendar, bg: 'bg-teal-50', iconColor: 'text-teal-500', 
          category: 'System', catColor: 'text-teal-400', 
          badge: 'Info', badgeBg: 'bg-teal-50', badgeColor: 'text-teal-600'
      };
      return { 
          icon: Bell, bg: 'bg-orange-50', iconColor: 'text-orange-500', 
          category: 'General', catColor: 'text-orange-400', 
          badge: 'General', badgeBg: 'bg-orange-50', badgeColor: 'text-orange-600'
      };
  };

  const displayAlerts = alerts;

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-slate-50" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
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
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Alerts & Notifications'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
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
      <main className="flex-1 max-h-screen overflow-y-auto pb-24 md:pb-4 relative">
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 mt-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        {/* Mobile back button, Desktop bell icon */}
                        <button onClick={() => navigate(-1)} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <Bell className="hidden md:block w-7 h-7 text-[#2c757c]" />
                        Alerts & Notifications
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-medium md:ml-10">Stay updated with important alerts, system events and reminders.</p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-green-50/50 text-[#2c757c] rounded-full text-sm font-bold border border-green-100 cursor-pointer hover:bg-green-50 transition-colors">
                    <Check className="w-4 h-4" /> Mark all as read
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar md:pb-0 mb-6 w-full -mx-4 px-4 md:mx-0 md:px-0">
                {['All', 'System', 'Safety', 'Appointments', 'General'].map((filter) => (
                    <button 
                        key={filter} 
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border shadow-sm
                            ${activeFilter === filter 
                                ? 'bg-[#2c757c] text-white border-[#2c757c]' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Alert List */}
            <div className="space-y-4">
                {displayAlerts.map((alert) => {
                    const config = getAlertConfig(alert.alert_type, alert.message);
                    const AlertIcon = config.icon;
                    
                    const dateObj = new Date(alert.timestamp);
                    const formattedDate = `${dateObj.getDate().toString().padStart(2,'0')}/${(dateObj.getMonth()+1).toString().padStart(2,'0')}/${dateObj.getFullYear()}, ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}`;

                    return (
                        <div key={alert.id} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 md:gap-6 items-start transition-transform hover:scale-[1.01]">
                            
                            <div className="flex gap-4 md:gap-6 w-full">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full ${config.bg} ${config.iconColor} flex items-center justify-center shrink-0 mt-1`}>
                                    <AlertIcon className="w-6 h-6" />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[10px] md:text-xs font-bold ${config.catColor} mb-1 tracking-wider uppercase`}>{config.category}</div>
                                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-1.5">{alert.alert_type}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-3 pr-2 md:pr-10">{alert.message}</p>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] md:text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formattedDate}
                                    </div>
                                </div>
                                
                                {/* Status & Arrow (Desktop) */}
                                <div className="hidden md:flex flex-col items-end justify-between py-1 shrink-0">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg} ${config.badgeColor} flex items-center gap-1`}>
                                        {config.badge}
                                        <ChevronRight className={`w-3.5 h-3.5 ${config.badgeColor} opacity-70`} />
                                    </div>
                                </div>
                            </div>

                            {/* Status (Mobile) */}
                            <div className="w-full flex md:hidden items-center justify-end border-t border-slate-100 pt-3 mt-1">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg} ${config.badgeColor} flex items-center gap-1`}>
                                    {config.badge}
                                    <ChevronRight className={`w-3.5 h-3.5 ${config.badgeColor} opacity-70`} />
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="hidden md:flex justify-between items-center mt-10 text-xs font-bold text-slate-400 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2c757c]"></div>
                    You're all caught up!
                </div>
                <div className="flex items-center gap-2">
                    Last updated: 27/09/2026, 18:53
                    <RefreshCw className="w-3.5 h-3.5" />
                </div>
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
        <Link to="/professional/alerts" className="flex flex-col items-center gap-1.5 text-[#2c757c] relative">
          <div className="relative">
            <Bell className="w-5 h-5"/>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[10px] font-bold">Alerts</span>
        </Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <User className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
