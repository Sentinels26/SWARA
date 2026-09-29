import { useState, useEffect } from 'react';
import { Home, MessageCircle, HeartPulse, User, Activity, ArrowLeft, Plus, Trash2, ShieldAlert, Phone, Users, Save, CheckCircle, Edit2, Shield, Calendar, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SurvivorSidebar } from '../../components/SurvivorSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import api from '../../api';

interface PlanItem {
  id: string;
  text: string;
  isHelpful?: boolean;
}

export default function Support() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
  
  // SOS State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState('');
  
  // Professional Contact State
  const [professional, setProfessional] = useState<any>(null);

  // Safety Plan State
  const [planStatus, setPlanStatus] = useState('Draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [warningSigns, setWarningSigns] = useState<PlanItem[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<PlanItem[]>([]);
  const [safePlaces, setSafePlaces] = useState<PlanItem[]>([]);
  const [reasonsToReachOut, setReasonsToReachOut] = useState<PlanItem[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<PlanItem[]>([]);
  
  // Generic modal state for adding/editing items
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<string>('');
  const [editItem, setEditItem] = useState<PlanItem>({ id: '', text: '' });
  
  // Delete confirm modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  useEffect(() => {
    if (user && user.role === 'SURVIVOR') {
      api.get(`/cases/`).then((res: any) => {
        if (res.data.length > 0) {
            const caseData = res.data[0];
            setActiveCaseId(caseData.id);
            setProfessional({
              name: caseData.professional_alias || "Assigned Professional",
              id: caseData.professional_id
            });
            fetchSafetyPlan(caseData.id);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const fetchSafetyPlan = async (caseId: number) => {
    try {
      const res = await api.get(`/safety-plan/${caseId}`);
      if (res.data) {
        setWarningSigns(JSON.parse(res.data.warning_signs || "[]"));
        setCopingStrategies(JSON.parse(res.data.coping_strategies || "[]"));
        setSafePlaces(JSON.parse(res.data.safe_places || "[]"));
        setReasonsToReachOut(JSON.parse(res.data.reasons_to_reach_out || "[]"));
        setTrustedContacts(JSON.parse(res.data.trusted_contacts || "[]"));
        setPlanStatus(res.data.status || "Active");
        setLastSaved(new Date(res.data.updated_at));
      }
    } catch (err) {
      console.error("Failed to load safety plan", err);
    }
  };

  const saveSafetyPlan = async () => {
    if (!activeCaseId) return;
    setIsSaving(true);
    setSaveMessage('Saving...');
    try {
      const payload = {
        warning_signs: JSON.stringify(warningSigns),
        coping_strategies: JSON.stringify(copingStrategies),
        safe_places: JSON.stringify(safePlaces),
        reasons_to_reach_out: JSON.stringify(reasonsToReachOut),
        trusted_contacts: JSON.stringify(trustedContacts),
        status: "Active"
      };
      await api.put(`/safety-plan/${activeCaseId}`, payload);
      setPlanStatus("Active");
      setLastSaved(new Date());
      setSaveMessage('Saved Successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSOS = async (type: string) => {
    try {
      await api.post('/alerts/trigger_sos/');
      setSosStatus(`Alerting ${type}...`);
      setTimeout(() => { setIsSosOpen(false); setSosStatus(''); }, 4000);
    } catch (err) {
      console.error(err);
      setSosStatus('Failed to send SOS.');
    }
  };

  const openEditModal = (type: string, item?: PlanItem) => {
    setEditType(type);
    if (item) {
      setEditItem(item);
    } else {
      setEditItem({ id: Math.random().toString(36).substr(2, 9), text: '' });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!editItem.text.trim()) return;
    const saveToState = (stateSetter: any, items: PlanItem[]) => {
      const existing = items.findIndex(i => i.id === editItem.id);
      if (existing >= 0) {
        const newItems = [...items];
        newItems[existing] = editItem;
        stateSetter(newItems);
      } else {
        stateSetter([...items, editItem]);
      }
    };

    if (editType === 'warning') saveToState(setWarningSigns, warningSigns);
    if (editType === 'coping') saveToState(setCopingStrategies, copingStrategies);
    if (editType === 'places') saveToState(setSafePlaces, safePlaces);
    if (editType === 'reasons') saveToState(setReasonsToReachOut, reasonsToReachOut);
    if (editType === 'contacts') saveToState(setTrustedContacts, trustedContacts);
    
    setIsEditModalOpen(false);
    // Mark as draft since there are unsaved changes
    setPlanStatus("Draft");
  };

  const handleDeleteRequest = (type: string, id: string) => {
    setDeleteTarget({ type, id });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    
    const delFromState = (stateSetter: any, items: PlanItem[]) => {
      stateSetter(items.filter(i => i.id !== id));
    };

    if (type === 'warning') delFromState(setWarningSigns, warningSigns);
    if (type === 'coping') delFromState(setCopingStrategies, copingStrategies);
    if (type === 'places') delFromState(setSafePlaces, safePlaces);
    if (type === 'reasons') delFromState(setReasonsToReachOut, reasonsToReachOut);
    if (type === 'contacts') delFromState(setTrustedContacts, trustedContacts);
    
    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
    setPlanStatus("Draft");
  };
  
  const toggleHelpful = (id: string) => {
    const newItems = copingStrategies.map(item => {
      if (item.id === id) return { ...item, isHelpful: !item.isHelpful };
      return item;
    });
    setCopingStrategies(newItems);
    setPlanStatus("Draft");
  };

  const renderSection = (title: string, type: string, items: PlanItem[], onToggleHelpful?: (id: string) => void) => (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button onClick={() => openEditModal(type)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-[#2c757c] hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm italic">
          No {title.toLowerCase()} added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-colors">
              <div className="flex-1 flex items-center gap-3">
                {onToggleHelpful && (
                  <button onClick={() => onToggleHelpful(item.id)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${item.isHelpful ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-slate-300'}`}>
                    {item.isHelpful && <CheckCircle className="w-4 h-4" />}
                  </button>
                )}
                <span className="text-sm font-medium text-slate-700">{item.text}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(type, item)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDeleteRequest(type, item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const hasCheckedInToday = false;
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row pb-20 md:pb-0 font-sans" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {/* Desktop Sidebar */}
      <SurvivorSidebar onOpenSos={() => setIsSosOpen(true)} hasCheckedInToday={typeof hasCheckedInToday !== "undefined" ? hasCheckedInToday : false} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        <header className="md:hidden fixed top-0 left-0 w-full flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] bg-white/90 backdrop-blur-xl border-b border-white/60 z-50">
          <button onClick={() => navigate('/survivor/dashboard')} className="p-2 text-[#2c757c]"><ArrowLeft className="w-5 h-5"/></button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 tracking-wide">Safety Plan</span>
          </div>
          <div className="w-8"></div>
        </header>

        <div className="flex-1 p-5 pt-[calc(76px+env(safe-area-inset-top))] md:p-10 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1f2937] flex items-center gap-3">
                 <Shield className="w-8 h-8 text-[#2c757c]" /> My Safety Plan
              </h1>
              <p className="text-slate-500 mt-2 text-sm max-w-lg">A personalized guide to help you manage distress, identify warning signs, and connect with support when you need it most. Only you and your authorized Care Team can view this.</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${planStatus === 'Draft' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {planStatus} {lastSaved && `(Updated ${lastSaved.toLocaleDateString()})`}
              </span>
              <Button onClick={saveSafetyPlan} disabled={isSaving} className="bg-[#2c757c] hover:bg-[#1f595e] text-white flex items-center gap-2">
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Plan"}
              </Button>
              {saveMessage && <span className="text-xs text-green-600 font-bold">{saveMessage}</span>}
            </div>
          </div>

          {/* Emergency Safety Card */}
          <div className="bg-[#fff4f1] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border border-red-50 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-[#f5746b] mt-1 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Emergency Support</h3>
                <p className="text-sm text-slate-600">If you are in immediate danger, bypass the plan and contact emergency services.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:112" className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full py-3 px-6 shadow-md transition-colors text-center text-sm whitespace-nowrap flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call 112 (India)
              </a>
              <button onClick={() => setIsSosOpen(true)} className="bg-[#eb5757] hover:bg-[#d94848] text-white font-bold rounded-full py-3 px-6 shadow-md transition-colors text-center text-sm whitespace-nowrap flex items-center justify-center gap-2">
                 SOS Protocol
              </button>
            </div>
          </div>

          {/* Care Team Section */}
          <div className="bg-[#f0f9fa] rounded-3xl p-6 shadow-sm border border-slate-50 mb-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#2c757c]" /> Professional Support</h3>
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                <div>
                  <div className="font-bold text-slate-800">{professional?.name}</div>
                  <div className="text-xs text-slate-500">Assigned Care Professional</div>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" className="text-sm border-slate-200" onClick={() => navigate('/survivor/chat')}><MessageCircle className="w-4 h-4 mr-1" /> Message</Button>
                   <Button className="bg-[#2c757c] hover:bg-[#1a5b60] text-white text-sm" onClick={() => navigate('/survivor/journey')}><Calendar className="w-4 h-4 mr-1"/> Book</Button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection("1. Warning Signs", "warning", warningSigns)}
            {renderSection("2. Things That Help Me Cope", "coping", copingStrategies, toggleHelpful)}
            {renderSection("3. Safe Places", "places", safePlaces)}
            {renderSection("4. Reasons to Reach Out", "reasons", reasonsToReachOut)}
            {renderSection("5. Trusted People I Can Contact", "contacts", trustedContacts)}
          </div>
          
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50">
        <Link to="/survivor/dashboard" className="flex flex-col items-center p-2 text-slate-400">
          <Home className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/survivor/journey" className="flex flex-col items-center p-2 text-slate-400">
          <Activity className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Journey</span>
        </Link>
        <Link to="/survivor/support" className="flex flex-col items-center p-2 text-[#2c757c]">
          <HeartPulse className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-bold">Support</span>
        </Link>
        <Link to="/survivor/profile" className="flex flex-col items-center p-2 text-slate-400">
          <User className="w-6 h-6 mb-1"/>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

      {/* Modals */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Item`}>
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">Description</label>
          <textarea 
            value={editItem.text} 
            onChange={(e) => setEditItem({...editItem, text: e.target.value})}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            rows={3}
            autoFocus
            placeholder="Type here..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="bg-[#2c757c] text-white" onClick={handleSaveItem}>Confirm</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to remove this item from your safety plan?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} title="Emergency Support">
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-2 drop-shadow-md" />
            <h3 className="text-xl font-bold text-slate-900">Do you need immediate help?</h3>
            <p className="text-slate-600 text-sm mt-2">
              Bypass routine monitoring and connect with immediate support networks.
            </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => triggerSOS('Emergency Services (112)')} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Phone className="w-5 h-5"/></div>
                <div>
                  <div className="font-bold text-red-700">Call Emergency Services</div>
                  <div className="text-xs text-red-600">Dial 112 directly</div>
                </div>
              </div>
            </button>
            <button onClick={() => triggerSOS('Care Team')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><Users className="w-5 h-5"/></div>
                <div>
                  <div className="font-bold text-slate-900">Alert My Care Team</div>
                  <div className="text-xs text-slate-500">{professional?.name || "Assigned Professional"} & staff</div>
                </div>
              </div>
            </button>
            
            {trustedContacts.map(tc => (
              <a href={`sms:?body=I need help. I am using my safety plan.`} key={tc.id} onClick={() => triggerSOS('Trusted Contact: ' + tc.text)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><User className="w-5 h-5"/></div>
                  <div>
                    <div className="font-bold text-slate-900">Contact {tc.text}</div>
                    <div className="text-xs text-slate-500">Trusted Safety Plan Contact</div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {sosStatus && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center font-bold animate-pulse">
              {sosStatus}
            </div>
          )}
          <Button variant="outline" className="w-full border-slate-300" onClick={() => setIsSosOpen(false)}>Cancel / Go Back</Button>
        </div>
      </Modal>

    </div>
  );
}
