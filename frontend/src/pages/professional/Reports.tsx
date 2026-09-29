// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FileText, Download, ChevronLeft, Home as HomeIcon, Users, 
    ShieldAlert, Calendar, BookOpen, Activity, Settings, User, 
    Menu, X, ChevronDown, ChevronRight, Info, AlertCircle, HeartPulse, Clock, MoreHorizontal
} from 'lucide-react';

export default function ProfessionalReports() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reportType, setReportType] = useState('ALL');

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
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
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
      <main className="flex-1 max-h-screen overflow-y-auto pb-24 md:pb-8">
        <div className="w-full max-w-6xl mx-auto p-4 md:p-10 mt-2 md:mt-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        Reports
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-medium ml-8 md:ml-10">Generate and export system-wide case metrics.</p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold self-end md:self-auto border border-green-100">
                    <ShieldAlert className="w-3.5 h-3.5" /> Secure & Encrypted
                </div>
            </div>

            {/* Generate System Report Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
                <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-blue-50/50 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-full h-full opacity-40" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: 'cover' }}></div>
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-blue-400 relative z-10" />
                </div>
                
                <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Generate System Report</h2>
                    <p className="text-slate-500 text-sm md:text-base font-medium mb-6 md:mb-8 leading-relaxed max-w-2xl">
                        Download PDF summaries of all active caseloads, AI generated insights, and longitudinal stability metrics for your practice.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:w-72">
                            <select id="reportType_select" name="reportType_select" 
                                className="appearance-none w-full bg-white border border-slate-200 rounded-full pl-5 pr-10 py-3 text-sm md:text-base font-semibold text-slate-700 focus:outline-none focus:border-[#2c757c] cursor-pointer shadow-sm transition-colors" 
                                value={reportType} 
                                onChange={e => setReportType(e.target.value)}
                            >
                                <option value="ALL">All Active Cases</option>
                                <option value="CRITICAL">Critical Cases Only</option>
                                <option value="AI_SUMMARY">AI Insights Summary</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button className="w-full md:w-auto px-8 py-3 bg-[#2c757c] text-white font-bold rounded-full hover:bg-[#235e63] transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Download className="w-5 h-5" /> Download PDF
                        </button>
                    </div>
                    
                    <div className="flex items-start md:items-center gap-2 text-xs md:text-sm text-slate-400 font-medium">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 md:mt-0" />
                        <p>Reports are generated with non-identifiable identifiers (SW-[ID]) by default to maintain privacy compliance unless overridden.</p>
                    </div>
                </div>
            </div>

            {/* Quick Insights Section */}
            <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                            Quick Insights
                        </h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">A snapshot of your current caseload and system health.</p>
                    </div>
                    <button className="text-[#2c757c] text-xs md:text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap">
                        View Full Report <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Stat 1 */}
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-32 md:h-40 transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm font-semibold">
                            <Users className="w-4 h-4 text-green-500" /> Total Active Cases
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800">13</div>
                            <div className="text-[10px] md:text-xs font-bold text-green-500 mt-1 flex items-center gap-0.5">
                                ↑ 2 new
                            </div>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-32 md:h-40 transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm font-semibold">
                            <AlertCircle className="w-4 h-4 text-orange-500" /> High Priority Cases
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800">4</div>
                            <div className="text-[10px] md:text-xs font-bold text-orange-500 mt-1 flex items-center gap-0.5">
                                ↑ 1
                            </div>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-32 md:h-40 transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm font-semibold whitespace-nowrap">
                            <HeartPulse className="w-4 h-4 text-green-500" /> Avg. Stability Score
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800">72%</div>
                            <div className="text-[10px] md:text-xs font-bold text-green-500 mt-1 flex items-center gap-0.5">
                                ↑ 5%
                            </div>
                        </div>
                    </div>
                    {/* Stat 4 */}
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-32 md:h-40 transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm font-semibold">
                            <Calendar className="w-4 h-4 text-purple-500" /> Last 7 Days
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800">8</div>
                            <div className="text-[10px] md:text-xs font-bold text-green-500 mt-1 flex items-center gap-0.5">
                                ↑ 3
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reports Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" /> Recent Reports
                        </h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">View and download previously generated reports.</p>
                    </div>
                    <button className="text-[#2c757c] text-xs md:text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs md:text-sm text-slate-400 font-semibold">
                                <th className="pb-4 font-semibold">Report Name</th>
                                <th className="pb-4 font-semibold hidden md:table-cell">Generated On</th>
                                <th className="pb-4 font-semibold hidden md:table-cell">Case Scope</th>
                                <th className="pb-4 font-semibold">Type</th>
                                <th className="pb-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 group">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm md:text-base font-bold text-slate-800">System Report - Sep 27, 2026</p>
                                            {/* Mobile only subtext */}
                                            <p className="text-xs text-slate-500 font-medium md:hidden mt-0.5">27/09/2026, 23:45 • All Active Cases</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 hidden md:table-cell">
                                    <p className="text-sm text-slate-500 font-medium">27/09/2026, 23:45</p>
                                </td>
                                <td className="py-4 hidden md:table-cell">
                                    <p className="text-sm text-slate-500 font-medium">All Active Cases</p>
                                </td>
                                <td className="py-4">
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">PDF</span>
                                </td>
                                <td className="py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
        <Link to="/professional/appointments" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Calendar className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Calendar</span>
        </Link>
        <Link to="/professional/reports" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <FileText className="w-5 h-5"/>
          <span className="text-[10px] font-bold">More</span>
        </Link>
      </nav>

    </div>
  );
}
