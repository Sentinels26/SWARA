// @ts-nocheck
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronDown, ChevronRight, Plus, Home as HomeIcon, Users, Calendar, MoreHorizontal, FileText, BookOpen, Settings, Menu, X, ShieldAlert, User, Activity } from 'lucide-react';
import api from '../../api';
import { LogoutButton } from '../../components/LogoutButton';

interface CheckIn {
  id: number;
  case_id: number;
  distress_level: number;
  sleep_quality: number;
  activity_level: number;
  support_priority: string;
  timestamp: string;
  survivor_alias?: string;
  status?: string;
}

export default function ProfessionalCases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cases, setCases] = useState<CheckIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/api/cases/`).then(async res => {
        const rawCases = res.data;
        const processed = [];
        for (const c of rawCases) {
          try {
            const cRes = await api.get(`/api/checkins/${c.id}`);
            let latest: any = { case_id: c.id, survivor_alias: c.survivor_alias, status: c.status, support_priority: 'STABLE', timestamp: c.created_at, distress_level: 0, sleep_quality: 0, activity_level: 0 };
            if (cRes.data.length > 0) {
              latest = { ...latest, ...cRes.data[0], survivor_alias: c.survivor_alias, status: c.status };
            }
            processed.push(latest);
          } catch (e) {
            console.error(e);
          }
        }
        processed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCases(processed);
      }).catch(err => console.error(err));
    }
  }, [user]);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.survivor_alias?.toLowerCase().includes(searchTerm.toLowerCase()) || c.case_id.toString().includes(searchTerm);
    const matchesPriority = filterPriority === 'ALL' || c.support_priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityInfo = (priority: string) => {
    switch(priority) {
        case 'HIGH PRIORITY': return { label: 'High', class: 'bg-red-50 text-red-500', icon: '❤️' }; 
        case 'ELEVATED': return { label: 'Moderate', class: 'bg-orange-50 text-orange-500', icon: '!' };
        case 'STABLE': 
        case 'OBSERVE':
        default: return { label: 'Low', class: 'bg-indigo-50 text-indigo-500', icon: '💧' };
    }
  };
  
  const getStatusInfo = (status: string) => {
      if (status === 'ACTIVE') return { label: 'Active', class: 'bg-green-50 text-green-600', dot: 'bg-green-500' };
      return { label: 'Under Review', class: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Desktop Sidebar */}
                  {/* Sidebar */}
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
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
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
      <main className="flex-1 max-h-screen overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cases</h1>
                </div>
                <button onClick={() => navigate('/professional/referral')} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#2c757c] hover:bg-[#1f595e] text-white rounded-full text-sm font-semibold transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> New Case
                </button>
                <div className="md:hidden flex gap-3">
                   <button className="text-slate-500"><Search className="w-6 h-6"/></button>
                </div>
            </header>
            
            {/* Desktop Filters */}
            <div className="hidden md:block space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input id="input_ccbe6036" name="input_ccbe6036" 
                        type="text" 
                        placeholder="Search by name, ID or keyword..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 shadow-sm rounded-full text-sm focus:outline-none focus:border-[#2c757c]"
                    />
                </div>
                
                {/* Filters Row */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="relative">
                            <select id="select_87e9f632" name="select_87e9f632" 
                                className="appearance-none bg-white border border-slate-100 shadow-sm rounded-full pl-4 pr-10 py-2.5 text-sm font-semibold text-[#2c757c] focus:outline-none cursor-pointer"
                            >
                                <option>All Status</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#2c757c] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select id="select_35b04904" name="select_35b04904" 
                                value={filterPriority === 'ALL' ? 'All Priority' : filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="appearance-none bg-white border border-slate-100 shadow-sm rounded-full pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">All Priority</option>
                                <option value="HIGH PRIORITY">High</option>
                                <option value="ELEVATED">Moderate</option>
                                <option value="STABLE">Low</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select id="select_f6c79f40" name="select_f6c79f40" 
                                className="appearance-none bg-white border border-slate-100 shadow-sm rounded-full pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                            >
                                <option>All Types</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        Sort: <span className="font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">Newest <ChevronDown className="w-4 h-4"/></span>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-4 px-6 text-sm font-semibold text-slate-400 flex items-center gap-2"><div className="w-3 text-center">None</div> <ChevronDown className="w-3 h-3"/></th>
                                <th className="py-4 px-6 text-sm font-semibold text-[#2c757c]">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-[#2c757c]">Priority</th>
                                <th className="py-4 px-6 text-sm font-semibold text-[#2c757c]">Last Check-in</th>
                                <th className="py-4 px-6 text-sm font-semibold text-[#2c757c]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCases.map(ci => {
                                const prio = getPriorityInfo(ci.support_priority);
                                const stat = getStatusInfo(ci.status || 'ACTIVE');
                                return (
                                    <tr key={ci.case_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                <img src="/user.jpeg" alt="Avatar" className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="font-bold text-slate-800 text-[15px]">{ci.survivor_alias || 'Unknown'}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stat.class}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${stat.dot}`}></div> {stat.label}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${prio.class}`}>
                                                <span className="text-xs">{prio.icon}</span> {prio.label}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-500">
                                            {new Date(ci.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? `Today, ${new Date(ci.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Yesterday'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <button onClick={() => navigate(`/professional/case/${ci.case_id}`)} className="text-[#2c757c] text-sm font-bold flex items-center gap-1 hover:underline">
                                                View <ChevronRight className="w-4 h-4"/>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                <div className="relative mb-6">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input id="input_58eb399d" name="input_58eb399d" 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 shadow-sm rounded-full text-sm focus:outline-none focus:border-[#2c757c]"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2">
                        <MoreHorizontal className="w-5 h-5 text-[#2c757c] rotate-90" />
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredCases.map(ci => {
                        const prio = getPriorityInfo(ci.support_priority);
                        const stat = getStatusInfo(ci.status || 'ACTIVE');
                        return (
                            <div key={ci.case_id} onClick={() => navigate(`/professional/case/${ci.case_id}`)} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                            <img src="/user.jpeg" alt="Avatar" className="w-full h-full object-cover"/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-[16px]">{ci.survivor_alias || 'Unknown'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 flex flex-col">
                                                <span>{new Date(ci.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? `Today, ${new Date(ci.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Yesterday'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${prio.class}`}>
                                        {prio.label}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stat.class}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${stat.dot}`}></div> {stat.label}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
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
        <Link to="/professional/cases" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <Users className="w-5 h-5"/>
          <span className="text-[10px] font-bold">Cases</span>
        </Link>
        <Link to="/professional/appointments" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Calendar className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Calendar</span>
        </Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5"/>
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>

    </div>
  );
}
