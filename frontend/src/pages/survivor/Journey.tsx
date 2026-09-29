import { useState, useEffect } from 'react';
import { Home, HeartPulse, User, Bell, Activity, ArrowLeft, Moon, Zap, Check, Calendar, FileText, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SurvivorSidebar } from '../../components/SurvivorSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Plus, Clock, Video } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

import { ReferenceLine } from 'recharts';

export default function Journey() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Changing default to Overview based on user request
  const [activeTab, setActiveTab] = useState('My Journey');
  const [innerApptTab, setInnerApptTab] = useState('Appointments');
  
  const [checkins, setCheckins] = useState<any[]>([]);
  const [baseline, setBaseline] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptType, setApptType] = useState('VIDEO');
  const [apptError, setApptError] = useState('');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const hasCheckedInToday = false;
  // suppress unused warning
  void isSosOpen;


  useEffect(() => {
    if (user && user.role === 'SURVIVOR') {
      api.get(`/appointments/`).then((res: any) => setAppointments(res.data)).catch((err: any) => console.error(err));
      

      api.get(`/cases/`).then((res: any) => {
        if (res.data.length > 0) {
            const caseId = res.data[0].id;
            setActiveCaseId(caseId);

            Promise.all([
                api.get(`/cases/detail/${caseId}`),
                api.get(`/journey/${caseId}/analysis`)
            ]).then(([detailRes, analysisRes]) => {
                const caseDetail = detailRes.data;
                setCheckins(caseDetail.checkins.reverse());
                setBaseline(caseDetail.baseline);
                setAnalysis(analysisRes.data);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
      }).catch(() => {
          setError(true);
          setLoading(false);
      });
    }
  }, [user]);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const CustomTooltip = ({ active, payload, baselineValue }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const val = payload[0].value;
      const diff = baselineValue ? val - baselineValue : 0;
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[200px]">
          <p className="font-bold text-slate-800 mb-2">{data.fullDate}</p>
          <div className="text-sm text-slate-600 mb-1">
            Observation: <span className="font-bold text-slate-800">{val}</span>
          </div>
          {baselineValue !== undefined && baselineValue !== null && (
             <>
               <div className="text-sm text-slate-600 mb-1">
                 Baseline: <span className="font-bold text-slate-800">{baselineValue.toFixed(1)}</span>
               </div>
               <div className="text-sm text-slate-600 mb-1">
                 Deviation: <span className={`font-bold ${diff > 0 ? 'text-teal-600' : diff < 0 ? 'text-orange-500' : 'text-slate-500'}`}>
                   {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                 </span>
               </div>
             </>
          )}
          <div className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-50">
            Source: {data.source}
          </div>
        </div>
      );
    }
    return null;
  };


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

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#2c757c] rounded-full animate-spin mb-4"></div>
          <p>Analyzing your journey...</p>
        </div>
      );
    }

    if (error || !analysis) {
      return (
        <div className="text-center py-20 text-slate-500">
          <p>We are unable to load your journey analysis at this moment.</p>
        </div>
      );
    }

    const chartData = checkins.map(c => ({
      name: new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(c.timestamp).toLocaleString(),
      Sleep: c.sleep_quality,
      Distress: c.distress_level,
      Energy: c.activity_level,
      source: 'Check-in'
    }));

    return (
      <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
        
        {/* Section 1: Overview */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Overview — Your Baseline</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className={`px-4 py-1.5 text-sm font-bold rounded-full w-fit ${analysis.baselineStatus === 'Established' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              {analysis.baselineStatus === 'Established' ? 'Established' : 'Building'}
            </div>
            <span className="text-sm text-slate-500">
              {analysis.baselineStatus === 'Established' 
                ? "Your personal baseline has been established."
                : "Your personal baseline is based on your recent check-ins and reported patterns and is still being built."}
            </span>
          </div>
          
          <h3 className="font-bold text-slate-700 text-sm mb-3">Tracked Dimensions</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.dimensions?.map((dim: string, i: number) => (
              <div key={i} className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium">
                {dim}
              </div>
            ))}
            {!analysis.dimensions?.length && <div className="text-sm text-slate-400">No dimensions tracked yet.</div>}
          </div>
        </div>

        {/* Section 2: Trajectory */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Trajectory</h2>
          
          {checkins.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
              Not enough observations to display trajectory graphs yet. Keep checking in!
            </div>
          ) : (
            <>
              {/* Sleep Chart */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 mb-6">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" /> Sleep Consistency
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip baselineValue={baseline?.avg_sleep} />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                      {baseline?.avg_sleep && (
                        <ReferenceLine y={baseline.avg_sleep} stroke="#94a3b8" strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: 'Personal Baseline', fill: '#94a3b8', fontSize: 11 }} />
                      )}
                      <Line type="monotone" dataKey="Sleep" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Distress Chart */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 mb-6">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" /> Distress Levels
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip baselineValue={baseline?.avg_distress} />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                      {baseline?.avg_distress && (
                        <ReferenceLine y={baseline.avg_distress} stroke="#94a3b8" strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: 'Personal Baseline', fill: '#94a3b8', fontSize: 11 }} />
                      )}
                      <Line type="monotone" dataKey="Distress" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sections 3, 4, 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Change from Baseline</h3>
            <ul className="space-y-3 flex-1">
              {analysis.sustainedChanges?.map((change: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5"><Activity className="w-3 h-3" /></div>
                  <span className="text-sm text-slate-600">{change}</span>
                </li>
              ))}
              {!analysis.sustainedChanges?.length && <li className="text-sm text-slate-400">No sustained changes detected.</li>}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">What changed?</h3>
            <ul className="space-y-3 flex-1">
              {analysis.whatChanged?.map((change: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-0.5"><Zap className="w-3 h-3" /></div>
                  <span className="text-sm text-slate-600">{change}</span>
                </li>
              ))}
              {!analysis.whatChanged?.length && <li className="text-sm text-slate-400">No significant recent changes.</li>}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">What stayed stable?</h3>
            <ul className="space-y-3 flex-1">
              {analysis.whatRemainedStable?.map((change: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3" /></div>
                  <span className="text-sm text-slate-600">{change}</span>
                </li>
              ))}
              {!analysis.whatRemainedStable?.length && <li className="text-sm text-slate-400">No stable patterns detected yet.</li>}
            </ul>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 px-2">
          <Info className="w-4 h-4" />
          <span>SWARA provides supportive pattern insights, not a clinical diagnosis.</span>
        </div>
      </div>
    );
  };

  const renderAppointmentsAndReports = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Inner Tabs for Appointments & Reports */}
      <div className="flex gap-6 mb-2 border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {['Appointments', 'Reports', 'Documents'].map(tab => (
          <button 
            key={tab}
            onClick={() => setInnerApptTab(tab)}
            className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap ${innerApptTab === tab ? 'text-[#2c757c]' : 'text-slate-400 hover:text-slate-600'} ${tab === 'Documents' ? 'hidden md:block' : ''}`}
          >
            {tab === 'Appointments' && <Calendar className="w-4 h-4 inline-block mr-2 mb-0.5" />}
            {tab === 'Reports' && <FileText className="w-4 h-4 inline-block mr-2 mb-0.5" />}
            {tab === 'Documents' && <Check className="w-4 h-4 inline-block mr-2 mb-0.5" />}
            {tab}
            {innerApptTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2c757c] rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Column: Upcoming Appointments */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Upcoming Appointments</h3>
            <button className="text-xs text-slate-400 hover:text-slate-600 font-semibold hidden md:block">View all &gt;</button>
          </div>
          
          
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


          </div>
        </div>

        {/* Right Column: Recent Reports */}
        <div className="md:w-5/12">
          <h3 className="font-bold text-slate-800 text-sm md:text-base mb-4">Recent Reports</h3>
          
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs md:text-sm">Wellbeing Progress Report</h4>
                  <span className="text-[10px] md:text-xs text-slate-400 block mt-0.5">15 Apr 2025</span>
                </div>
              </div>
              <button className="text-xs font-bold text-teal-600 hover:text-teal-700">Download</button>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs md:text-sm">Support Priority Summary</h4>
                  <span className="text-[10px] md:text-xs text-slate-400 block mt-0.5">10 Apr 2025</span>
                </div>
              </div>
              <button className="text-xs font-bold text-slate-500 hover:text-slate-700">View</button>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs md:text-sm">Journey Progress Report</h4>
                  <span className="text-[10px] md:text-xs text-slate-400 block mt-0.5">01 Apr 2025</span>
                </div>
              </div>
              <button className="text-xs font-bold text-teal-600 hover:text-teal-700">Download</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Need help explaining... */}
      <div className="bg-[#f2f8f8] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-50 shadow-sm mt-2">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <HeartPulse className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1">Need help explaining your journey?</h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md">
              Generate a simple summary of your progress for your next appointment or support meeting.
            </p>
          </div>
        </div>
        <Button className="bg-[#3c848c] hover:bg-[#2c656c] text-white rounded-full py-3 px-6 shadow-md font-semibold w-full md:w-auto text-sm">
          Create Summary
        </Button>
      </div>

    </div>
  );



  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row pb-20 md:pb-0 font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
      {/* Desktop Sidebar */}
      <SurvivorSidebar onOpenSos={() => setIsSosOpen(true)} hasCheckedInToday={typeof hasCheckedInToday !== "undefined" ? hasCheckedInToday : false} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 w-full flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] bg-white/90 backdrop-blur-xl border-b border-white/60 z-50">
          <button onClick={() => navigate('/survivor/dashboard')} className="p-2 text-[#2c757c]"><ArrowLeft className="w-5 h-5"/></button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 tracking-wide">
              {activeTab === 'Current Position' ? 'Support Priority' : activeTab === 'Appointments & Reports' ? 'Appointments + Reports' : activeTab === 'Day Journey' ? 'Day Journey' : 'Your Progress'}
            </span>
          </div>
          <div className="w-9"></div> {/* spacer */}
        </header>

        <div className="flex-1 p-5 pt-[calc(76px+env(safe-area-inset-top))] md:p-10 max-w-5xl mx-auto w-full">
          
          {/* Desktop Top Nav */}
          <header className="hidden md:flex justify-end items-center mb-8 text-sm text-slate-500 gap-6">
            <span>{currentDate}</span>
            <button className="text-slate-400 hover:text-slate-600"><Bell className="w-5 h-5" /></button>
            <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.profile_picture_url ? <img src={user.profile_picture_url} className="w-full h-full object-cover"/> : (user?.nickname?.[0] || user?.full_name?.[0] || 'A').toUpperCase()}
            </div>
          </header>

          <h1 className="text-2xl md:text-3xl font-bold text-[#1f2937] mb-6 md:mb-8 hidden md:block">
            {activeTab === 'Current Position' ? 'Support Priority' : activeTab === 'Appointments & Reports' ? 'Appointments & Reports' : activeTab === 'Day Journey' ? 'Day Journey' : 'Your Progress'}
          </h1>

          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible gap-4 md:gap-8 mb-6 md:mb-8 border-b border-slate-200 snap-x">
            {['My Journey', 'Appointments & Reports'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap snap-start ${activeTab === tab ? 'text-[#2c757c]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2c757c] rounded-t-full"></div>}
              </button>
            ))}
          </div>

          {activeTab === 'My Journey' && renderMyJourney()}
          {activeTab === 'Appointments & Reports' && renderAppointmentsAndReports()}
          
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50">
        <Link to="/survivor/dashboard" className="flex flex-col items-center p-2 text-slate-400">
          <Home className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/survivor/journey" className="flex flex-col items-center p-2 text-[#2c757c]">
          <Activity className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-bold">Progress</span>
        </Link>
        <Link to="/survivor/support" className="flex flex-col items-center p-2 text-slate-400">
          <HeartPulse className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Support</span>
        </Link>
        <Link to="/survivor/profile" className="flex flex-col items-center p-2 text-slate-400">
          <User className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>


      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Appointment">
        <div className="space-y-4 p-2">
          {apptError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{apptError}</div>}
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input id="input_ec852c01" name="input_ec852c01" type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input id="input_c652afd3" name="input_c652afd3" type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Appointment Type</label>
            <select id="select_b5dfc87a" name="select_b5dfc87a" value={apptType} onChange={e => setApptType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
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
