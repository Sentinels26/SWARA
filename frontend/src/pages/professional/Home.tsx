// @ts-nocheck
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home as HomeIcon, Users, Bell, Calendar, FileText, BookOpen, Activity, Settings, ChevronRight, AlertCircle, Clock, MessageCircle, MoreHorizontal, Menu, X, ShieldAlert, User } from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/api/dashboard/professional`).then(res => {
        setDashboardData(res.data);
      }).catch(err => console.error(err));
    }
  }, [user]);

  const activeCases = dashboardData?.activeCases || 0;
  const casesNeedingAttention = dashboardData?.casesNeedingAttention || 0;
  const todayAppointmentsCount = dashboardData?.todayAppointments || 0;
  const totalCases = dashboardData?.totalCasesHandled || 0;
  const recentAlerts = dashboardData?.recentAlerts || [];
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  const priorityData = [
    { name: 'Critical', value: casesNeedingAttention, color: '#e11d48' },
    { name: 'High', value: Math.max(0, activeCases - casesNeedingAttention), color: '#f59e0b' },
    { name: 'Moderate', value: 0, color: '#3b82f6' },
    { name: 'Low', value: Math.max(0, totalCases - activeCases), color: '#10b981' },
  ];


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
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
          <Link to="/professional/dashboard" title="Home" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><HomeIcon className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Home'}</Link>
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
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
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="font-bold text-lg text-slate-800">Dashboard</div>
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/professional/alerts')} className="text-slate-400 relative">
               <Bell className="w-5 h-5" />
               {casesNeedingAttention > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>}
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
                <h1 className="text-[28px] font-bold tracking-tight animated-gradient-text">Good morning, {user?.full_name?.split(' ')[0] || 'Dr. Sharma'}</h1>
                <p className="text-slate-500 mt-1">Here's your overview for today.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                   <input id="input_a1561761" name="input_a1561761" type="text" placeholder="Search cases, names, or ID..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#2c757c] w-64 shadow-sm" />
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                   </div>
                </div>
                <button onClick={() => navigate('/professional/alerts')} className="text-slate-400 hover:text-slate-600 relative">
                  <Bell className="w-6 h-6" />
                  {casesNeedingAttention > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>}
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                  <img src="/user.jpeg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </header>
            
            {/* Mobile Greeting */}
            <div className="md:hidden mt-2 mb-4">
               <h1 className="text-xl font-bold animated-gradient-text">Good morning, {user?.full_name?.split(' ')[0] || 'Dr. Sharma'}</h1>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
                        Active Cases
                    </div>
                    <div>
                       <div className="text-3xl font-bold text-slate-800">{activeCases}</div>
                       <div className="text-xs font-bold text-green-600 mt-1"></div>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col justify-between h-36">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                        Needs Attention
                    </div>
                    <div>
                       <div className="text-3xl font-bold text-slate-800">{casesNeedingAttention}</div>
                       <div className="text-xs font-bold text-red-500 mt-1"></div>
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
                       <div className="text-3xl font-bold text-slate-800">{todayAppointmentsCount}</div>
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
                        {recentAlerts.length > 0 ? recentAlerts.map((alert: any) => (
                          <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle className="w-5 h-5"/></div>
                                  <div>
                                      <div className="text-sm font-bold text-slate-800">{alert.message}</div>
                                      <div className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleDateString()}</div>
                                  </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                          </div>
                        )) : (
                          <div className="text-sm text-slate-500">No recent alerts</div>
                        )}
                    </div>

                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
                        <button onClick={() => navigate('/professional/appointments')} className="text-xs font-bold text-[#2c757c] hover:underline">View all</button>
                    </div>
                    
                    <div className="space-y-3">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt: any) => (
                          <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8fcfc]">
                              <div className="flex items-center gap-4">
                                  <div className="text-sm font-bold text-slate-500 w-16 text-right">{new Date(appt.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div className="text-sm font-bold text-[#2c757c] bg-[#e8f4f6] px-4 py-2 rounded-full shadow-sm">{appt.title}</div>
                              </div>
                              <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                  <span className="hidden sm:inline">{appt.type}</span>
                                  <ChevronRight className="w-5 h-5 text-slate-400" />
                              </div>
                          </div>
                        )) : (
                          <div className="text-sm text-slate-500">No upcoming appointments</div>
                        )}
                    </div>

                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <button onClick={() => navigate('/professional/cases')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><Users className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">View All Cases</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/appointments')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><Calendar className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">Schedule<br/>Appointment</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/alerts')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#e8f4f6] text-[#2c757c] flex items-center justify-center shrink-0"><MessageCircle className="w-6 h-6"/></div>
                            <div className="text-left"><div className="text-sm font-bold text-[#2c757c]">Send Message</div></div>
                        </button>
                        <button onClick={() => navigate('/professional/reports')} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
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
