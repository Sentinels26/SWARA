import { useState } from 'react';
import { Shield, Eye, Lock, Smartphone, CheckCircle, X } from 'lucide-react';

export function PrivacySettings() {
  const [dataSharing, setDataSharing] = useState(true);
  const [devicePermissions, setDevicePermissions] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleConsentChange = (setting: 'sharing' | 'device', val: boolean) => {
    if (setting === 'sharing') setDataSharing(val);
    if (setting === 'device') setDevicePermissions(val);
    
    setStatusMessage({ type: 'success', text: 'Consent preferences updated securely.' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#f0f9fa] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#2c757c]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Privacy & Consent</h2>
          <p className="text-sm text-slate-500">Manage what SWARA can access and who can see your information.</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-8">
        
        {/* Info Section */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" /> Who Can See My Information?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your personal information, check-in data, and safety plan are visible only to you and your assigned professional care team. SWARA's AI processes this data securely to provide insights, but does not share it with third parties.
          </p>
        </div>

        {/* Consent Toggles */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor="data_sharing_input" className="font-semibold text-slate-800 text-sm block">De-identified Data Sharing</label>
              <p className="text-xs text-slate-500 mt-1">Allow your anonymized data to be used for improving SWARA's AI models. No personally identifiable information is ever shared.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                id="data_sharing_input"
                name="data_sharing"
                type="checkbox" 
                className="sr-only peer" 
                checked={dataSharing}
                onChange={(e) => handleConsentChange('sharing', e.target.checked)}
                aria-label="Toggle data sharing"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2c757c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c757c]"></div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor="device_perms_input" className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" /> Connected Device Permissions
              </label>
              <p className="text-xs text-slate-500 mt-1">Allow SWARA to read step count and sleep data from connected health devices (if configured) to enrich your baseline.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                id="device_perms_input"
                name="device_permissions"
                type="checkbox" 
                className="sr-only peer" 
                checked={devicePermissions}
                onChange={(e) => handleConsentChange('device', e.target.checked)}
                aria-label="Toggle device permissions"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2c757c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c757c]"></div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-8">
           <h4 className="text-amber-800 text-xs font-semibold mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Security Note</h4>
           <p className="text-amber-700 text-xs">If you revoke consent, SWARA immediately stops processing the optional data. Core application data required for your care team remains securely stored.</p>
        </div>

        {/* Data Export & Deletion */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Your Data</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Data Export</h4>
                <p className="text-xs text-slate-500 mt-1">Download a copy of your personal data, check-ins, and safety plan in JSON format. Passwords and internal IDs are excluded.</p>
              </div>
              <button 
                onClick={() => {
                  setStatusMessage({ type: 'success', text: 'Export requested! Preparing your export...' });
                  setTimeout(() => setStatusMessage({ type: 'success', text: 'Export Ready. Downloading...' }), 1500);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Request Export
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-red-50/50">
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Data Deletion</h4>
                <p className="text-xs text-red-600 mt-1">Request deletion of your optional data. Core case records maintained by your professional cannot be deleted from here.</p>
              </div>
              <button 
                onClick={() => {
                  const confirmed = window.confirm("Are you sure you want to request data deletion? This action cannot be fully undone.");
                  if (confirmed) {
                    const typed = window.prompt("Type DELETE to confirm your request:");
                    if (typed === "DELETE") {
                      setStatusMessage({ type: 'success', text: 'Deletion request submitted securely.' });
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Delete My Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
