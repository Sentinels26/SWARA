// @ts-nocheck
import { LogoutButton } from '../../components/LogoutButton';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Brain, FileText, Calendar, ShieldAlert, CheckCircle, Clock, Moon, Battery, FileWarning, Home as HomeIcon, Users, BookOpen, Settings, User, Menu, X } from 'lucide-react';
import api from '../../api';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Modal } from '../../components/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CaseWorkspace() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [caseData, setCaseData] = useState<any>(null);
  const [aiAnalysisList, setAiAnalysisList] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [safetyPlan, setSafetyPlan] = useState<any>(null);
  
  const [error, setError] = useState<string | null>(null);

  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('MONITOR');
  const [actionNotes, setActionNotes] = useState('');
  
  const [isInterventionModalOpen, setInterventionModalOpen] = useState(false);
  const [intType, setIntType] = useState('counselling_follow_up');
  const [intNotes, setIntNotes] = useState('');

  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [eventCategory, setEventCategory] = useState('Legal');
  const [eventDesc, setEventDesc] = useState('');

  const fetchCaseData = async () => {
    try {
      setError(null);
      const res = await api.get(`/cases/detail/${id}`);
      setCaseData(res.data);
      
      const analysisRes = await api.get(`/analysis/${id}`);
      setAiAnalysisList(analysisRes.data);

      const evRes = await api.get(`/api/cases/${id}/events`);
      setEvents(evRes.data);

      const intRes = await api.get(`/api/cases/${id}/interventions`);
      setInterventions(intRes.data);
      
      const planRes = await api.get(`/safety-plan/${id}`);
      setSafetyPlan(planRes.data);

      const aptRes = await api.get(`/appointments/`);
      setAppointments(aptRes.data.filter((a: any) => a.case_id === Number(id)));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load case data');
    }
  };

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/actions/?case_id=${id}`, { action_type: actionType, notes: actionNotes });
      setActionModalOpen(false);
      setActionNotes('');
      fetchCaseData();
    } catch (err) {
      console.error(err);
    }
  };
  
  const submitIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/cases/${id}/interventions`, { type: intType, notes: intNotes });
      setInterventionModalOpen(false);
      setIntNotes('');
      fetchCaseData();
    } catch (err) {
      console.error(err);
    }
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/cases/${id}/events`, { category: eventCategory, description: eventDesc });
      setEventModalOpen(false);
      setEventDesc('');
      fetchCaseData();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <LoadingScreen error={error} onRetry={fetchCaseData} />;
  if (!caseData) return <LoadingScreen message="Loading workspace..." />;

  const { case: c, baseline, checkins, actions } = caseData;
  const latestCheckin = checkins[0] || {};
  
  const chartData = [...checkins].reverse().map(ci => ({
    day: new Date(ci.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    distress: ci.distress_level,
    sleep: ci.sleep_quality
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> },
    { id: 'checkins', label: 'Check-ins', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <FileWarning className="w-4 h-4" /> },
    { id: 'interventions', label: 'Interventions', icon: <Activity className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'safety', label: 'Safety Plan', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'audit', label: 'Action Log', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {/* Sidebar Navigation */}
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

      <main className="flex-1 max-h-screen overflow-y-auto">
        {/* Sticky Header */}
        <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10 shadow-sm">
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        {c.survivor_alias} <span className="text-sm font-normal text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">SW-{c.id}</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Status: {c.status}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600 font-medium">Priority: <span className={`px-2 py-0.5 rounded-sm ${
                            latestCheckin.support_priority === 'HIGH PRIORITY' ? 'bg-red-100 text-red-700' :
                            latestCheckin.support_priority === 'ELEVATED' ? 'bg-orange-100 text-orange-700' :
                            latestCheckin.support_priority === 'OBSERVE' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                        }`}>{latestCheckin.support_priority || 'UNKNOWN'}</span></span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setInterventionModalOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition-colors border border-slate-200">
                        + Intervention
                    </button>
                    <button onClick={() => setEventModalOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition-colors border border-slate-200">
                        + Event
                    </button>
                    <button onClick={() => setActionModalOpen(true)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-colors">
                        Quick Note
                    </button>
                </div>
            </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {latestCheckin.support_priority === 'HIGH PRIORITY' && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm">
                            <h2 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5"/> Critical Alert
                            </h2>
                            <p className="text-red-700 text-sm">{latestCheckin.why_explanation}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-500 text-sm mb-4">Latest Check-in</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Activity className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                                    <div className="font-bold text-xl">{latestCheckin.distress_level || '-'}</div>
                                    <div className="text-xs text-slate-500">Distress</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Moon className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                                    <div className="font-bold text-xl">{latestCheckin.sleep_quality || '-'}</div>
                                    <div className="text-xs text-slate-500">Sleep</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <Battery className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                                    <div className="font-bold text-xl">{latestCheckin.activity_level || '-'}</div>
                                    <div className="text-xs text-slate-500">Activity</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-500 text-sm mb-4">Baseline Comparison</h3>
                            {baseline ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Avg Distress</span>
                                        <span className="font-medium text-slate-800">{baseline.avg_distress}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Avg Sleep</span>
                                        <span className="font-medium text-slate-800">{baseline.avg_sleep}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Baseline not yet established.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-500 text-sm mb-4">Support Context</h3>
                            <p className="text-sm text-slate-700">{c.support_context || "No context provided."}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-6">Longitudinal Trends (Last 5 Check-ins)</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                                    <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="distress" stroke="#ef4444" strokeWidth={3} name="Distress Level" dot={{ r: 4, strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={3} name="Sleep Quality" dot={{ r: 4, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Brain className="text-accent-blue" /> AI Analysis History</h2>
                    {aiAnalysisList.length === 0 && <p className="text-slate-500">No analysis available yet.</p>}
                    {aiAnalysisList.map(analysis => (
                        <div key={analysis.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                                <span className="font-semibold text-slate-700 text-sm">Analysis from {new Date(analysis.created_at).toLocaleString()}</span>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">{analysis.status}</span>
                            </div>
                            <div className="p-6">
                                {analysis.status === 'COMPLETED' && analysis.structured_analysis ? (
                                    (() => {
                                        try {
                                            const parsed = JSON.parse(analysis.structured_analysis);
                                            return (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-1">Interpretation</h4>
                                                        <p className="text-slate-600 text-sm">{parsed.contextual_interpretation}</p>
                                                    </div>
                                                    {parsed.observed_changes && parsed.observed_changes.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-1">Observed Changes</h4>
                                                            <ul className="list-disc pl-5 text-slate-600 text-sm">
                                                                {parsed.observed_changes.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        } catch(e) {
                                            return <p className="text-red-500">Failed to parse analysis.</p>
                                        }
                                    })()
                                ) : (
                                    <p className="text-slate-500 text-sm">Analysis is processing or failed.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'events' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Case Events</h2>
                        <button onClick={() => setEventModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">+ Add Event</button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {events.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No events logged for this case.</div>
                        ) : (
                            events.map(ev => (
                                <div key={ev.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-slate-900">{ev.category}</span>
                                        <span className="text-xs text-slate-500">{new Date(ev.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{ev.description}</p>
                                    {!ev.is_relevant && <span className="inline-block mt-2 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Archived / Irrelevant</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'interventions' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Interventions & Actions</h2>
                        <button onClick={() => setInterventionModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">+ Add Intervention</button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {interventions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No interventions logged for this case.</div>
                        ) : (
                            interventions.map(int => (
                                <div key={int.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-slate-900">{int.type.replace(/_/g, ' ').toUpperCase()}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${int.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{int.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">{int.notes}</p>
                                    {int.outcome && <div className="text-sm bg-slate-50 p-2 rounded border border-slate-100"><span className="font-semibold">Outcome:</span> {int.outcome}</div>}
                                    <div className="text-xs text-slate-500 mt-3">{new Date(int.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Appointments</h2>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {appointments.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No appointments scheduled for this case.</div>
                        ) : (
                            appointments.map(apt => (
                                <div key={apt.id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-slate-900">{apt.title}</div>
                                        <div className="text-sm text-slate-500 mt-1">{new Date(apt.scheduled_time).toLocaleString()} • {apt.duration_minutes} mins • {apt.type}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                        apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-200 text-slate-700'
                                    }`}>{apt.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'safety' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Safety Plan</h2>
                    {safetyPlan ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Warning Signs</h3>
                                <p className="text-slate-800">{safetyPlan.warning_signs === '[]' ? 'Not filled out.' : safetyPlan.warning_signs}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Trusted Contacts</h3>
                                <p className="text-slate-800">{safetyPlan.trusted_contacts === '[]' ? 'Not filled out.' : safetyPlan.trusted_contacts}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Safe Places</h3>
                                <p className="text-slate-800">{safetyPlan.safe_places === '[]' ? 'Not filled out.' : safetyPlan.safe_places}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500">No safety plan exists for this case.</p>
                    )}
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Action Log</h2>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {actions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No actions logged.</div>
                        ) : (
                            actions.map((act: any) => (
                                <div key={act.id} className="p-4 flex gap-4">
                                    <div className="mt-1"><Clock className="w-4 h-4 text-slate-400" /></div>
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{act.action_type}</div>
                                        <div className="text-slate-700 text-sm mt-1">{act.notes}</div>
                                        <div className="text-xs text-slate-400 mt-2">{new Date(act.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Case Reports</h2>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Generate Case Summary</h3>
                        <p className="text-slate-500 mb-6">Compile check-ins, events, and AI insights into a secure PDF report for external authorities or court use.</p>
                        <button className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">
                            Generate PDF Report
                        </button>
                    </div>
                </div>
            )}
            
            {(activeTab === 'checkins' || activeTab === 'notes' || activeTab === 'closure') && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
                    This section is under construction. Data exists in the overview.
                </div>
            )}

        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} title="Log Quick Note">
        <form className="space-y-4" onSubmit={submitAction}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select id="select_effee7a4" name="select_effee7a4" value={actionType} onChange={e => setActionType(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="MONITOR">Monitor / Observe</option>
              <option value="CONTACT">General Contact</option>
              <option value="NOTE">Case Note</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)} className="w-full p-2 text-sm border rounded-md h-24" required></textarea>
          </div>
          <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium">Save Note</button>
        </form>
      </Modal>

      <Modal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} title="Add Case Event">
        <form className="space-y-4" onSubmit={submitEvent}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Category</label>
            <select id="select_19661a24" name="select_19661a24" value={eventCategory} onChange={e => setEventCategory(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="Legal">Legal / Police</option>
              <option value="Medical">Medical Incident</option>
              <option value="Financial">Financial Change</option>
              <option value="Housing">Housing Change</option>
              <option value="Other">Other Significant Event</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} className="w-full p-2 text-sm border rounded-md h-24" placeholder="What happened..." required></textarea>
          </div>
          <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium">Log Event</button>
        </form>
      </Modal>

      <Modal isOpen={isInterventionModalOpen} onClose={() => setInterventionModalOpen(false)} title="Log Intervention">
        <form className="space-y-4" onSubmit={submitIntervention}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Intervention Type</label>
            <select id="select_1b223f2d" name="select_1b223f2d" value={intType} onChange={e => setIntType(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="counselling_follow_up">Counselling Follow-up</option>
              <option value="legal_referral">Legal Referral</option>
              <option value="safety_plan_review">Safety Plan Review</option>
              <option value="crisis_intervention">Crisis Intervention</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes & Plan</label>
            <textarea value={intNotes} onChange={e => setIntNotes(e.target.value)} className="w-full p-2 text-sm border rounded-md h-24" placeholder="Details of the intervention..." required></textarea>
          </div>
          <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium">Save Intervention</button>
        </form>
      </Modal>

    </div>
  );
}
