// @ts-nocheck
import { LogoutButton } from '../../../components/LogoutButton';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ArrowLeft, Phone, AlertTriangle, Activity, Brain, Home as HomeIcon, Users, ShieldAlert, Calendar, FileText, BookOpen, Settings, User, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../api';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PlantConsistency } from '../../../components/PlantConsistency';

export default function CaseDetail() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { id } = useParams();
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [aiAnalysisList, setAiAnalysisList] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const fetchCaseData = async () => {
    try {
      setError(null);
      const res = await api.get(`/api/cases/detail/${id}`);
      setCaseData(res.data);
      
      const analysisRes = await api.get(`/api/analysis/${id}`);
      setAiAnalysisList(analysisRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load case data');
    }
  };

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const [actionType, setActionType] = useState('MONITOR');
  const [actionNotes, setActionNotes] = useState('');

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/actions/?case_id=${id}`, { action_type: actionType, notes: actionNotes });
      setActionModalOpen(false);
      setActionNotes('');
      fetchCaseData(); // Refresh UI
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <LoadingScreen error={error} onRetry={fetchCaseData} />;
  if (!caseData) return <LoadingScreen message="Loading case details..." />;

  const { case: c, baseline, checkins } = caseData;
  const latestCheckin = checkins[0] || {};
  
  const chartData = [...checkins].reverse().map(ci => ({
    day: new Date(ci.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    distress: ci.distress_level,
    sleep: ci.sleep_quality
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
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
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Case #{c.id} ({c.survivor_alias})</h1>
              <p className="text-slate-500 mt-1">Status: {c.status} • Context: {c.support_context}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setActionModalOpen(true)}><Phone className="w-4 h-4 mr-2" /> Log Action</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`md:col-span-2 ${latestCheckin.support_priority === 'HIGH PRIORITY' ? 'border-red-200' : ''}`}>
              <CardHeader className={latestCheckin.support_priority === 'HIGH PRIORITY' ? 'bg-red-50/50' : 'bg-slate-50'}>
                <div className="flex justify-between items-center">
                  <CardTitle className={`flex items-center gap-2 ${latestCheckin.support_priority === 'HIGH PRIORITY' ? 'text-red-900' : 'text-slate-800'}`}>
                    {latestCheckin.support_priority === 'HIGH PRIORITY' && <AlertTriangle className="w-5 h-5 text-red-600" />} 
                    Current Status: {latestCheckin.support_priority}
                  </CardTitle>
                  <Badge variant={latestCheckin.support_priority === 'HIGH PRIORITY' ? 'destructive' : 'default'}>Needs Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                
                {/* Explainability View */}
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-[#2c757c]" />
                    <h3 className="text-lg font-bold text-slate-800">SWARA Explainability</h3>
                  </div>

                  {aiAnalysisList.length > 0 ? (
                    (() => {
                      const latest = aiAnalysisList[0];
                      if (latest.status === 'PROCESSING') {
                        return <p className="text-slate-500">AI analysis is currently processing...</p>;
                      }
                      if (latest.status === 'FAILED') {
                        return <p className="text-red-500">AI analysis unavailable — structured monitoring remains active.</p>;
                      }
                      
                      if (!baseline) {
                        return (
                          <div className="text-slate-600">
                            Not enough observations are available to establish a reliable comparison yet.
                          </div>
                        );
                      }

                      if (latest.structured_analysis) {
                        try {
                          const analysis = JSON.parse(latest.structured_analysis);
                          const isStable = latestCheckin.support_priority === 'STABLE' || latestCheckin.support_priority === 'OBSERVE';
                          
                          return (
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">
                                  {isStable ? 'WHY NO MAJOR CHANGE WAS DETECTED' : 'WHY SWARA FLAGGED THIS'}
                                </h4>
                                <ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">
                                  {analysis.observed_changes?.length > 0 ? (
                                    analysis.observed_changes.map((change: string, idx: number) => (
                                      <li key={idx}>{change}</li>
                                    ))
                                  ) : (
                                    <li>{latestCheckin.why_explanation || 'Signals are consistent with baseline.'}</li>
                                  )}
                                  {analysis.supporting_evidence?.length > 0 && analysis.supporting_evidence.map((ev: string, idx: number) => (
                                    <li key={`ev-${idx}`}>{ev}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">WHAT THIS MEANS</h4>
                                <p className="text-slate-600 text-sm">
                                  {analysis.contextual_interpretation || analysis.summary}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">DATA COMPLETENESS</h4>
                                <p className="text-slate-600 text-sm">
                                  {analysis.uncertainty?.length > 0 
                                    ? analysis.uncertainty.join(' ') 
                                    : `${Math.min(checkins.length, 7)} of the last 7 expected check-ins available.`}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">SUGGESTED NEXT STEP</h4>
                                <p className="text-slate-600 text-sm font-medium">
                                  {analysis.recommended_attention || "Consider reviewing the recent changes with your care team."}
                                </p>
                              </div>
                            </div>
                          );
                        } catch(e) {
                          return <p className="text-red-500">Error parsing Explainability output.</p>;
                        }
                      }
                      return <p className="text-slate-500">No explanation available.</p>;
                    })()
                  ) : (
                    <div className="text-slate-600">
                      {!baseline 
                        ? "Not enough observations are available to establish a reliable comparison yet." 
                        : "No AI analysis available for this case yet."}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-400 italic">
                      AI-assisted support prioritization — not a diagnosis. Professional review required.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-4">Longitudinal Trends (Last 5 Days)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="distress" stroke="#ef4444" strokeWidth={3} name="Distress Level" />
                      <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={3} name="Sleep Quality" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-accent-blue" /> Suggested Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => { setActionType('CONTACT'); setActionNotes('Scheduling check-in call based on AI suggestion'); setActionModalOpen(true); }}>Schedule Check-in Call</Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => { setActionType('MONITOR'); setActionNotes('Adjusting support priority to OBSERVE'); setActionModalOpen(true); }}>Adjust Support Priority</Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => { setActionType('MONITOR'); setActionNotes('Pushed guided meditation exercise'); setActionModalOpen(true); }}>Push Guided Meditation</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" /> Baseline Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Avg Distress</span>
                      <span className="font-medium">{baseline?.avg_distress || 'N/A'} / 10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Avg Sleep</span>
                      <span className="font-medium">{baseline?.avg_sleep || 'N/A'} hrs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Activity Level</span>
                      <span className="font-medium">{baseline?.activity_level || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" /> Consistency</CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t border-slate-100">
                  <PlantConsistency checkins={checkins} />
                </CardContent>
              </Card>
            </div>
          </div>
          
        </div>
      </main>

      <Modal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} title="Log Professional Action">
        <form className="space-y-4" onSubmit={submitAction}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <select id="select_978b2b22" name="select_978b2b22" 
              value={actionType} onChange={e => setActionType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
              <option value="MONITOR">Monitor / Observe</option>
              <option value="CONTACT">Psychological First Aid Call</option>
              <option value="VISIT">Schedule Visit</option>
              <option value="REFER">Refer to Specialist</option>
              <option value="ESCALATE">Escalate to Emergency Services</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea 
              value={actionNotes} onChange={e => setActionNotes(e.target.value)}
              className="w-full p-2 text-sm border rounded-md h-24" placeholder="Summary of interaction..." required></textarea>
          </div>
          <Button type="submit" className="w-full">Save Action</Button>
        </form>
      </Modal>
    </div>
  );
}
