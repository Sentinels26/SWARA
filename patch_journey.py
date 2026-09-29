with open('frontend/src/pages/survivor/Journey.tsx', 'r') as f:
    content = f.read()

import re

# Add Modal import
if 'import { Modal } from' not in content:
    content = content.replace("import { Button } from '../../components/ui/Button';", "import { Button } from '../../components/ui/Button';\nimport { Modal } from '../../components/ui/Modal';\nimport { Plus, Clock, Video } from 'lucide-react';")

# Add state variables
state_replacement = """
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptType, setApptType] = useState('VIDEO');
  const [apptError, setApptError] = useState('');
"""
content = re.sub(r'const \[appointments, setAppointments\] = useState<any\[\]>\(\[\]\);', state_replacement, content)

# Update fetch to save caseId
fetch_replacement = """
      api.get(`/cases/`).then((res: any) => {
        if (res.data.length > 0) {
            const caseId = res.data[0].id;
            setActiveCaseId(caseId);
"""
content = content.replace("""      api.get(`/cases/`).then((res: any) => {
        if (res.data.length > 0) {
            const caseId = res.data[0].id;""", fetch_replacement)

# Add bookAppointment function right before renderMyJourney
book_func = """
  const loadAppointments = () => {
    api.get(`/appointments/`).then((res: any) => setAppointments(res.data)).catch((err: any) => console.error(err));
  };

  const handleBookAppointment = async () => {
    setApptError('');
    if (!apptDate || !apptTime) {
        setApptError("Please select a date and time");
        return;
    }
    try {
        const scheduled_time = new Date(`${apptDate}T${apptTime}:00`).toISOString();
        await api.post('/appointments/', {
            case_id: activeCaseId,
            scheduled_time,
            title: "Check-in Session",
            type: apptType
        });
        setIsBookingModalOpen(false);
        loadAppointments();
    } catch (err: any) {
        setApptError(err.response?.data?.detail || "Failed to book appointment");
    }
  };
  
  const handleCancelAppointment = async (id: number) => {
    try {
        await api.patch(`/appointments/${id}/status?status=CANCELLED`);
        loadAppointments();
    } catch (err) {
        console.error(err);
    }
  };

  const renderMyJourney = () => {
"""
content = content.replace("  const renderMyJourney = () => {", book_func)

# Add Button and Modal
appt_replacement = """
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col gap-4">
            <Button className="w-full flex items-center justify-center gap-2 mb-2 bg-[#2c757c] hover:bg-[#1a5b60] text-white rounded-xl" onClick={() => {setIsBookingModalOpen(true); setApptError('');}}>
                <Plus className="w-4 h-4"/> Book Appointment
            </Button>
            
            {appointments.length === 0 && (
              <div className="text-center py-8 text-slate-500">No upcoming appointments.</div>
            )}
            {appointments.map((appt, i) => (
              <div key={appt.id} className={`flex flex-col md:flex-row md:items-center justify-between pb-4 ${i < appointments.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-4 mb-2 md:mb-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm md:text-base">{appt.title}</h4>
                    <span className="text-xs text-slate-500 block flex items-center gap-1">
                        <Clock className="w-3 h-3"/> {new Date(appt.scheduled_time).toLocaleString()} • {appt.duration_minutes}m
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 block mt-0.5">
                       {appt.type === 'VIDEO' ? <span className="text-blue-500 flex items-center gap-1"><Video className="w-3 h-3"/> Online session</span> : appt.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${appt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{appt.status}</span>
                    {appt.status === 'SCHEDULED' && <button onClick={() => handleCancelAppointment(appt.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold ml-2">Cancel</button>}
                </div>
              </div>
            ))}
"""
content = re.sub(r'<div className="bg-white rounded-3xl p-4 md:p-6 shadow-\[0_2px_15px_rgb\(0,0,0,0\.03\)\] border border-slate-50 flex flex-col gap-4">.*?\{appointments\.slice\(0, 3\)\.map\(\(appt, i\) => \(.*?\)\)}', appt_replacement, content, flags=re.DOTALL)

modal_addition = """
      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Appointment">
        <div className="space-y-4 p-2">
          {apptError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{apptError}</div>}
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Appointment Type</label>
            <select value={apptType} onChange={e => setApptType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="VIDEO">Online Session (External integration)</option>
              <option value="IN_PERSON">In-person</option>
              <option value="CALL">Phone Call</option>
            </select>
          </div>

          <Button className="w-full mt-4 bg-[#2c757c] hover:bg-[#1a5b60] text-white" onClick={handleBookAppointment}>Confirm Booking</Button>
        </div>
      </Modal>
    </div>
  );
}
"""
content = content.replace("    </div>\n  );\n}\n", modal_addition)

with open('frontend/src/pages/survivor/Journey.tsx', 'w') as f:
    f.write(content)
