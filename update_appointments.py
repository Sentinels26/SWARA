with open('frontend/src/pages/professional/Appointments.tsx', 'r') as f:
    content = f.read()

new_content = """import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ArrowLeft, Plus, Clock, Video, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface Appointment {
  id: number;
  case_id: number;
  title: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  type: string;
  survivor_id: number;
}

export default function ProfessionalAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  
  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('VIDEO');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      loadAppointments();
      api.get('/cases/').then(res => setCases(res.data)).catch(console.error);
    }
  }, [user]);
  
  const loadAppointments = () => {
    api.get(`/appointments/`).then(res => setAppointments(res.data)).catch(err => console.error(err));
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
        loadAppointments();
    } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to book appointment");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
        await api.patch(`/appointments/${id}/status?status=${status}`);
        loadAppointments();
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 md:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/professional/dashboard')} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
        </div>
        <Button className="flex items-center gap-2" onClick={() => { setIsModalOpen(true); setError(''); }}><Plus className="w-4 h-4" /> New Appointment</Button>
      </header>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-lg">Upcoming Schedule</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {appointments.length === 0 && (
            <div className="p-8 text-center text-slate-500">No appointments scheduled.</div>
          )}
          {appointments.map(appt => (
            <div key={appt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold uppercase">{new Date(appt.scheduled_time).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(appt.scheduled_time).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{appt.title}</h4>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" /> 
                    {new Date(appt.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                    • {appt.duration_minutes} min • {appt.type === 'VIDEO' ? <span className="flex items-center gap-1 text-blue-600"><Video className="w-3 h-3"/> Online Session (External)</span> : appt.type}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  appt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  appt.status === 'MISSED' ? 'bg-orange-100 text-orange-700' :
                  appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{appt.status}</span>
                
                {appt.status === 'SCHEDULED' && (
                  <>
                    <button onClick={() => updateStatus(appt.id, 'COMPLETED')} className="px-3 py-1 text-xs font-semibold bg-green-50 text-green-600 rounded-md hover:bg-green-100 border border-green-200">Complete</button>
                    <button onClick={() => updateStatus(appt.id, 'MISSED')} className="px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 border border-orange-200">Missed</button>
                    <button onClick={() => updateStatus(appt.id, 'CANCELLED')} className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200">Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Appointment">
        <div className="space-y-4 p-2">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Case/Survivor</label>
            <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="">-- Select --</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.survivor_alias || 'Unknown'}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Appointment Title/Note</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Check-in" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="VIDEO">Online Session (External integration)</option>
              <option value="IN_PERSON">In-person</option>
              <option value="CALL">Phone Call</option>
            </select>
          </div>

          <Button className="w-full mt-2" onClick={handleCreate}>Confirm Booking</Button>
        </div>
      </Modal>
    </div>
  );
}
"""

with open('frontend/src/pages/professional/Appointments.tsx', 'w') as f:
    f.write(new_content)
