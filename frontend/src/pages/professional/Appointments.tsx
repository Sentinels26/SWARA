// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home as HomeIcon, Users, Bell, Calendar, FileText, User, ShieldAlert, BookOpen, Activity, Settings, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LogoutButton } from '../../components/LogoutButton';

interface Appointment {
  id: number;
  case_id: number;
  title: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  type: string;
  survivor_id: number;
  survivor_alias?: string;
}

export default function ProfessionalAppointments() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('VIDEO');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get('/cases/').then(res => {
        setCases(res.data);
        loadAppointments(res.data);
      }).catch(console.error);
    }
  }, [user]);
  
  const loadAppointments = (loadedCases: any[]) => {
    api.get(`/appointments/`).then(res => {
      const appts = res.data.map((a: any) => {
        const c = loadedCases.find((caseObj: any) => caseObj.id === a.case_id);
        return { ...a, survivor_alias: c ? c.survivor_alias : 'Unknown' };
      });
      setAppointments(appts);
    }).catch(err => console.error(err));
  };

  const handleCreate = async () => {
    setError('');
    if (!selectedCaseId || !date || !time || !title) {
        setError("Please fill all fields");
        return;
    }
    
    try {
        const scheduled_time = new Date(`${date}T${time}:00`).toISOString();
        await api.post('/appointments/', {
            case_id: parseInt(selectedCaseId),
            scheduled_time,
            title,
            type
        });
        setIsModalOpen(false);
        loadAppointments(cases);
    } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to book appointment");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
        await api.patch(`/appointments/${id}/status?status=${status}`);
        loadAppointments(cases);
    } catch (err) {
        console.error(err);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (activeTab === 'Upcoming') return a.status === 'SCHEDULED';
    if (activeTab === 'Past') return a.status !== 'SCHEDULED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row font-sans pb-20 md:pb-0" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md" />
          <span className="font-bold text-lg text-slate-800 tracking-wide">SWARA</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400"><Bell className="w-5 h-5"/></button>
          <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.full_name ? user.full_name[0] : 'P'}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar (Styled like User Menu) */}
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
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
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
      <main className="flex-1 p-5 md:p-10 max-h-screen overflow-y-auto max-w-5xl mx-auto w-full">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-[1.75rem] font-bold text-[#1f2937] tracking-tight">Appointments</h1>
          <Button className="bg-[#2c757c] hover:bg-[#235e63] text-white rounded-full px-6 py-2.5 shadow-md font-medium flex items-center gap-2 self-start md:self-auto" onClick={() => { setIsModalOpen(true); setError(''); }}>
            Book Appointment
          </Button>
        </header>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-slate-200">
          {['Upcoming', 'Past', 'All'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === tab ? 'text-[#2c757c]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2c757c] rounded-t-full"></div>}
            </button>
          ))}
        </div>
        
        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50">
              No appointments found in this category.
            </div>
          )}
          {filteredAppointments.map(appt => (
            <div key={appt.id} className="bg-white rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 hover:shadow-md transition-shadow gap-4 relative overflow-hidden">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 shadow-sm border border-slate-200">
                  {appt.survivor_alias ? appt.survivor_alias[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1f2937]">{appt.survivor_alias || 'Unknown Survivor'}</h4>
                  <div className="text-xs text-[#6b7280] font-medium">{appt.title}</div>
                </div>
              </div>
              
              <div className="flex flex-col md:items-center text-left md:text-center w-full md:w-auto pl-16 md:pl-0">
                <div className="text-sm font-semibold text-[#374151]">
                  {new Date(appt.scheduled_time).toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-[#6b7280]">
                  {new Date(appt.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({appt.duration_minutes} min)
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto pl-16 md:pl-0 mt-2 md:mt-0">
                {appt.status === 'SCHEDULED' ? (
                   <button onClick={() => updateStatus(appt.id, 'COMPLETED')} className="px-5 py-2 text-xs font-bold bg-[#e8f4f6] text-[#2c757c] rounded-full hover:bg-[#d4ecef] transition-colors w-full md:w-auto text-center">
                     Mark Complete
                   </button>
                ) : (
                   <div className={`px-5 py-2 text-xs font-bold rounded-full w-full md:w-auto text-center ${
                     appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                     appt.status === 'MISSED' ? 'bg-orange-50 text-orange-700' :
                     'bg-red-50 text-red-700'
                   }`}>
                     {appt.status}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center p-3 px-6 z-10 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
        <Link to="/professional/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><HomeIcon className="w-5 h-5"/><span className="text-[10px] font-medium">Home</span></Link>
        <Link to="/professional/cases" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><Users className="w-5 h-5"/><span className="text-[10px] font-medium">Cases</span></Link>
        <Link to="/professional/appointments" className="flex flex-col items-center gap-1.5 text-[#2c757c]"><Calendar className="w-5 h-5"/><span className="text-[10px] font-bold">Appts</span></Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600"><User className="w-5 h-5"/><span className="text-[10px] font-medium">Profile</span></Link>
      </nav>
      
      {/* Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Appointment">
        <div className="space-y-4 p-2 font-sans">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Case/Survivor</label>
            <select id="select_d7ddb441" name="select_d7ddb441" value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c]">
              <option value="">-- Select --</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.survivor_alias || 'Unknown'} (SW-{c.id})</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Appointment Title/Note</label>
            <input id="input_44ffb5b0" name="input_44ffb5b0" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Check-in" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c]" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input id="input_ed634806" name="input_ed634806" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input id="input_95bab911" name="input_95bab911" type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c]" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
            <select id="select_e92afe8b" name="select_e92afe8b" value={type} onChange={e => setType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2c757c]">
              <option value="VIDEO">Online Session (External integration)</option>
              <option value="IN_PERSON">In-person</option>
              <option value="CALL">Phone Call</option>
            </select>
          </div>

          <Button className="w-full mt-4 bg-[#2c757c] hover:bg-[#235e63] rounded-xl py-3 text-white font-bold" onClick={handleCreate}>Confirm Booking</Button>
        </div>
      </Modal>
    </div>
  );
}
