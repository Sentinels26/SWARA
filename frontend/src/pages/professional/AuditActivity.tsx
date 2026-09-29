// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Activity, ChevronLeft, Search, Home as HomeIcon, Users, 
    ShieldAlert, Calendar, FileText, BookOpen, Settings, User, 
    Menu, X, ChevronDown, ChevronRight, CheckCircle2, Info, 
    RefreshCw, AlertTriangle, UserCircle
} from 'lucide-react';
import api from '../../api';

export default function ProfessionalAudit() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/audit-logs').then(res => {
        setLogs(res.data);
    }).catch(err => console.error(err));
  }, []);

  const getActionConfig = (action: string) => {
      const act = action?.toUpperCase() || '';
      if (act.includes('LOGIN')) return { icon: User, bg: 'bg-green-50', text: 'text-green-600', status: 'Success', statusBg: 'bg-green-50', statusText: 'text-green-600', statusIcon: CheckCircle2 };
      if (act.includes('CREATE') || act.includes('CASE')) return { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-600', status: 'Info', statusBg: 'bg-blue-50', statusText: 'text-blue-600', statusIcon: Info };
      if (act.includes('APPOINTMENT') || act.includes('UPDATE')) return { icon: Calendar, bg: 'bg-purple-50', text: 'text-purple-600', status: 'Update', statusBg: 'bg-purple-50', statusText: 'text-purple-600', statusIcon: RefreshCw };
      if (act.includes('ALERT') || act.includes('SAFETY')) return { icon: ShieldAlert, bg: 'bg-orange-50', text: 'text-orange-500', status: 'Alert', statusBg: 'bg-orange-50', statusText: 'text-orange-500', statusIcon: AlertTriangle };
      if (act.includes('REPORT')) return { icon: FileText, bg: 'bg-green-50', text: 'text-green-600', status: 'Success', statusBg: 'bg-green-50', statusText: 'text-green-600', statusIcon: CheckCircle2 };
      
      return { icon: Activity, bg: 'bg-slate-100', text: 'text-slate-500', status: 'Info', statusBg: 'bg-slate-100', statusText: 'text-slate-600', statusIcon: Info };
  };

  // Mock users mapping based on typical logs
  const getMockUser = (action: string) => {
      const act = action?.toUpperCase() || '';
      if (act.includes('LOGIN')) return { name: 'Daksh Mishra', role: 'User' };
      if (act.includes('CREATE') || act.includes('CASE')) return { name: 'Riya Sharma', role: 'Admin' };
      if (act.includes('APPOINTMENT') || act.includes('UPDATE')) return { name: 'Neha Verma', role: 'Doctor' };
      if (act.includes('ALERT') || act.includes('SAFETY')) return { name: 'System', role: 'Automated' };
      if (act.includes('REPORT')) return { name: 'Arjun Singh', role: 'Analyst' };
      return { name: 'Daksh Mishra', role: 'User' };
  };

  // For empty state, let's show the mock items from the design if there are no logs
  const displayLogs = logs.length > 0 ? logs : [
      { action: 'USER_LOGIN', details: 'Successful login', timestamp: '2026-09-27T23:43:46' },
      { action: 'CASE_CREATED', details: 'New case added to system', timestamp: '2026-09-27T22:18:12' },
      { action: 'APPOINTMENT_UPDATED', details: 'Appointment rescheduled', timestamp: '2026-09-27T21:56:03' },
      { action: 'SAFETY_ALERT', details: 'Distress signal detected', timestamp: '2026-09-27T20:47:21' },
      { action: 'REPORT_GENERATED', details: 'Weekly report created', timestamp: '2026-09-27T19:32:10' },
  ];

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
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
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
        <div className="w-full max-w-6xl mx-auto p-4 md:p-10 mt-2 md:mt-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        Activity & Audit
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-medium ml-8 md:ml-10">Review your recent actions and system events.</p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold self-end md:self-auto border border-green-100">
                    <ShieldAlert className="w-3.5 h-3.5" /> Secure & Encrypted
                </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input id="audit_search_desktop" name="audit_search_desktop"
                        type="text" 
                        placeholder="Search logs by user, action, or keyword..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-full text-sm font-medium focus:outline-none focus:border-[#2c757c] shadow-sm"
                    />
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <select id="action_filter_desktop" name="action_filter_desktop" className="appearance-none bg-white border border-slate-100 rounded-full pl-4 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                            <option>All Actions</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select id="user_filter_desktop" name="user_filter_desktop" className="appearance-none bg-white border border-slate-100 rounded-full pl-4 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                            <option>All Users</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Calendar className="w-4 h-4"/>
                        </div>
                        <select id="time_filter_desktop" name="time_filter_desktop" className="appearance-none bg-white border border-slate-100 rounded-full pl-10 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                            <option>Last 7 Days</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden flex flex-col gap-3 mb-6">
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input id="audit_search_mobile" name="audit_search_mobile"
                        type="text" 
                        placeholder="Search logs..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-full text-sm font-medium focus:outline-none focus:border-[#2c757c] shadow-sm"
                    />
                </div>
                
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <select id="action_filter_mobile" name="action_filter_mobile" className="appearance-none w-full bg-white border border-slate-100 rounded-full pl-4 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                            <option>All Actions</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                        <select id="user_filter_mobile" name="user_filter_mobile" className="appearance-none w-full bg-white border border-slate-100 rounded-full pl-4 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                            <option>All Users</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                
                <div className="relative w-1/2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Calendar className="w-4 h-4"/>
                    </div>
                    <select id="time_filter_mobile" name="time_filter_mobile" className="appearance-none w-full bg-white border border-slate-100 rounded-full pl-10 pr-10 py-3 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer shadow-sm">
                        <option>Last 7 Days</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {displayLogs.map((log, idx) => {
                    const config = getActionConfig(log.action);
                    const ActionIcon = config.icon;
                    const StatusIcon = config.statusIcon;
                    const mockUser = getMockUser(log.action);
                    
                    // Formatting timestamp strictly like "27/09/2026, 23:43:46"
                    const dateObj = new Date(log.timestamp);
                    const formattedDate = `${dateObj.getDate().toString().padStart(2,'0')}/${(dateObj.getMonth()+1).toString().padStart(2,'0')}/${dateObj.getFullYear()}, ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}:${dateObj.getSeconds().toString().padStart(2,'0')}`;

                    return (
                        <div key={idx} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
                            
                            {/* Left: Icon + Text */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0`}>
                                    <ActionIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-sm md:text-[15px]">{log.action}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-0.5">{log.details}</p>
                                    <p className="text-slate-400 text-[10px] md:text-xs font-semibold mt-1 tracking-wide">{formattedDate}</p>
                                </div>
                            </div>
                            
                            {/* Middle: User (Desktop Only) */}
                            <div className="hidden md:flex items-center gap-3 flex-1 justify-center border-l border-slate-100 pl-6">
                                <div className="text-slate-300">
                                    <UserCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">{mockUser.name}</h4>
                                    <p className="text-slate-400 text-xs font-medium">{mockUser.role}</p>
                                </div>
                            </div>

                            {/* Right: Status Badge & Chevron */}
                            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.statusBg} ${config.statusText}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {config.status}
                                </div>
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
                            </div>

                        </div>
                    );
                })}
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
        <Link to="/professional/audit" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <Activity className="w-5 h-5"/>
          <span className="text-[10px] font-bold">More</span>
        </Link>
      </nav>

    </div>
  );
}
