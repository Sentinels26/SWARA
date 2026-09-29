import sys

new_content = """import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronDown, ChevronRight, Plus, Home as HomeIcon, Users, Calendar, MoreHorizontal, MessageCircle, FileText, BookOpen, Settings } from 'lucide-react';
import api from '../../api';

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
  const [cases, setCases] = useState<CheckIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/cases/`).then(async res => {
        const rawCases = res.data;
        const processed = [];
        for (const c of rawCases) {
          try {
            const cRes = await api.get(`/checkins/${c.id}`);
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
      <aside className="w-64 bg-white/95 backdrop-blur-sm border-r border-slate-100 flex-col hidden md:flex sticky top-0 h-screen shrink-0 relative overflow-hidden">
        {/* Leafy bottom background */}
        <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none opacity-40" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "bottom" }}></div>
        <div className="flex items-center gap-3 p-8 relative z-10">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <div className="font-bold text-xl text-slate-800 tracking-wider">SWARA</div>
        </div>
        
        <nav className="flex-1 py-4 px-6 flex flex-col gap-2 overflow-y-auto relative z-10">
          <Link to="/professional/dashboard" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><HomeIcon className="w-5 h-5"/> Dashboard</Link>
          <Link to="/professional/cases" className="flex items-center gap-4 px-4 py-3 bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-2xl"><Users className="w-5 h-5"/> Cases</Link>
          <Link to="/professional/appointments" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Calendar className="w-5 h-5"/> Calendar</Link>
          <Link to="/professional/alerts" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><MessageCircle className="w-5 h-5"/> Messages</Link>
          <Link to="/professional/reports" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><FileText className="w-5 h-5"/> Reports</Link>
          <Link to="/professional/referral" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><BookOpen className="w-5 h-5"/> Resources</Link>
          <Link to="/professional/settings" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Settings className="w-5 h-5"/> Settings</Link>
        </nav>
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
                    <input 
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
                            <select 
                                className="appearance-none bg-white border border-slate-100 shadow-sm rounded-full pl-4 pr-10 py-2.5 text-sm font-semibold text-[#2c757c] focus:outline-none cursor-pointer"
                            >
                                <option>All Status</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#2c757c] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select 
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
                            <select 
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
                    <input 
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
"""

with open('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Cases.tsx', 'w') as f:
    f.write(new_content)
