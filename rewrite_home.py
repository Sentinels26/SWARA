import sys

new_content = """import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home as HomeIcon, Users, Bell, Calendar, FileText, BookOpen, Brain, Activity, Settings, User, ChevronRight, PlusCircle, AlertCircle, Clock, FileDown, ShieldAlert, MessageCircle, MoreHorizontal } from 'lucide-react';
import api from '../../api';
import { LogoutButton } from '../../components/LogoutButton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CheckIn {
  id: number;
  case_id: number;
  distress_level: number;
  sleep_quality: number;
  activity_level: number;
  support_priority: string;
  timestamp: string;
  survivor_alias?: string;
}

export default function ProfessionalHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/cases/`).then(async res => {
        const cases = res.data;
        const allCheckins = [];
        for (const c of cases) {
          try {
            const cRes = await api.get(`/checkins/${c.id}`);
            if (cRes.data.length > 0) {
              const latest = cRes.data[0];
              latest.survivor_alias = c.survivor_alias;
              allCheckins.push(latest);
            }
          } catch (e) {
            console.error(e);
          }
        }
        allCheckins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCheckins(allCheckins);
      }).catch(err => console.error(err));

      api.get('/appointments/').then(res => {
        setAppointments(res.data.filter((a: any) => a.status === 'SCHEDULED'));
      }).catch(err => console.error(err));
    }
  }, [user]);

  const priorityCounts = checkins.reduce((acc, ci) => {
    acc[ci.support_priority] = (acc[ci.support_priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = [
    { name: 'Critical', value: priorityCounts['HIGH PRIORITY'] || 1, color: '#e11d48' },
    { name: 'High', value: priorityCounts['ELEVATED'] || 4, color: '#f59e0b' },
    { name: 'Moderate', value: priorityCounts['OBSERVE'] || 7, color: '#3b82f6' },
    { name: 'Low', value: priorityCounts['STABLE'] || 12, color: '#10b981' },
  ];
  const totalCases = priorityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-col hidden md:flex sticky top-0 h-screen shrink-0 relative overflow-hidden">
        {/* Leafy bottom background */}
        <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none opacity-40" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "bottom" }}></div>
        <div className="flex items-center gap-3 p-8 relative z-10">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <div className="font-bold text-xl text-slate-800 tracking-wider">SWARA</div>
        </div>
        
        <nav className="flex-1 py-4 px-6 flex flex-col gap-2 overflow-y-auto relative z-10">
          <Link to="/professional/dashboard" className="flex items-center gap-4 px-4 py-3 bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-2xl"><HomeIcon className="w-5 h-5"/> Dashboard</Link>
          <Link to="/professional/cases" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Users className="w-5 h-5"/> Cases</Link>
          <Link to="/professional/appointments" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Calendar className="w-5 h-5"/> Calendar</Link>
          <Link to="/professional/alerts" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><MessageCircle className="w-5 h-5"/> Messages</Link>
          <Link to="/professional/reports" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><FileText className="w-5 h-5"/> Reports</Link>
          <Link to="/professional/referral" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><BookOpen className="w-5 h-5"/> Resources</Link>
          <Link to="/professional/settings" className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Settings className="w-5 h-5"/> Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto pb-20 md:pb-0">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="font-bold text-lg text-slate-800">Dashboard</div>
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/professional/alerts')} className="text-slate-400 relative">
               <Bell className="w-5 h-5" />
               {priorityCounts['HIGH PRIORITY'] > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>}
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                <img src="/user.jpeg" alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Desktop Header */}
            <header className="hidden md:flex justify-between items-center mb-6">
              <div>
                <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">Good morning, {user?.full_name?.split(' ')[0] || 'Dr. Sharma'}</h1>
                <p className="text-slate-500 mt-1">Here's your overview for today.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                   <input type="text" placeholder="Search cases, names, or ID..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#2c757c] w-64 shadow-sm" />
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                   </div>
                </div>
                <button onClick={() => navigate('/professional/alerts')} className="text-slate-400 hover:text-slate-600 relative">
                  <Bell className="w-6 h-6" />
                  {priorityCounts['HIGH PRIORITY'] > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>}
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                  <img src="/user.jpeg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </header>
            
            {/* Mobile Greeting */}
            <div className="md:hidden mt-2 mb-4">
               <h1 className="text-xl font-bold text-slate-800">Good morning, {user?.full_name?.split(' ')[0] || 'Dr. Sharma'}</h1>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
                        Active Cases
                    </div>
                    <div>
                       <div className="text-3xl font-bold text-slate-800">{checkins.length || 24}</div>
                       <div className="text-xs font-bold text-green-600 mt-1">↑ 2 new</div>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                        Needs Attention
                    </div>
                    <div>
                       <div className="text-3xl font-bold text-slate-800">{priorityCounts['HIGH PRIORITY'] || 5}</div>
                       <div className="text-xs font-bold text-red-500 mt-1">↑ 1</div>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col justify-between h-36 col-span-2 md:col-span-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                            Today's Appointments
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-4 md:mt-0">
                       <div className="text-3xl font-bold text-slate-800">{appointments.length || 8}</div>
                       <button onClick={() => navigate('/professional/appointments')} className="text-xs font-bold text-[#2c757c] bg-[#e8f4f6] px-4 py-2 rounded-full hover:bg-[#d4ecef] transition-colors">View calendar</button>
                    </div>
                </div>
            </div>

            {/* Grid layout for remaining sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Priority Overview */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100 h-80 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4">Priority Overview</h3>
                    <div className="flex-1 flex items-center">
                        <div className="w-1/2 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={priorityData} innerRadius="65%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl font-bold text-slate-800">{totalCases}</div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Cases</div>
                            </div>
                        </div>
                        <div className="w-1/2 pl-6 space-y-4">
                            {priorityData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100 h-80 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Alerts</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle className="w-5 h-5"/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Missed check-in</div>
                                    <div className="text-xs text-slate-500">2 hours ago</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Activity className="w-5 h-5"/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Increased distress signals</div>
                                    <div className="text-xs text-slate-500">4 hours ago</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><Clock className="w-5 h-5"/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Follow-up due</div>
                                    <div className="text-xs text-slate-500">Today</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
                        <button onClick={() => navigate('/professional/appointments')} className="text-xs font-bold text-[#2c757c] hover:underline">View all</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fcfc]">
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-slate-500 w-16 text-right">10:00 AM</div>
                                <div className="text-sm font-bold text-[#2c757c] bg-[#e8f4f6] px-4 py-2 rounded-full shadow-sm">Aisha Khan</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="hidden sm:inline">Follow-up</span>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-slate-400 w-16 text-right">11:30 AM</div>
                                <div className="text-sm font-bold text-slate-700 px-4 py-2">Priya Sharma</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="hidden sm:inline">Review</span>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-slate-400 w-16 text-right">02:00 PM</div>
                                <div className="text-sm font-bold text-slate-700 px-4 py-2">Sima Devi</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="hidden sm:inline">Initial Assessment</span>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <button onClick={() => navigate('/professional/cases')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><Users className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">View All Cases</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/appointments')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><Calendar className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">Schedule<br/>Appointment</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/alerts')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><MessageCircle className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">Send Message</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/reports')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><FileText className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">Create Report</div></div>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="h-6 md:hidden"></div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
        <Link to="/professional/dashboard" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <HomeIcon className="w-5 h-5"/>
          <span className="text-[10px] font-bold">Home</span>
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
          <MoreHorizontal className="w-5 h-5"/>
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>

    </div>
  );
}
"""

with open('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Home.tsx', 'w') as f:
    f.write(new_content)

print("Done")
