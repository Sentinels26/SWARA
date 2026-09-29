import { useState } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    checkInReminders: true,
    appointmentReminders: true,
    professionalMessages: true,
    weeklySummary: false,
    safetyNotifications: true
  });
  const [statusMessage, setStatusMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // In a real app, this would persist to the backend
      setStatusMessage({ type: 'success', text: 'Notification preferences saved.' });
      setTimeout(() => setStatusMessage(null), 3000);
      return next;
    });
  };

  const Toggle = ({ label, desc, field }: { label: string, desc: string, field: keyof typeof preferences }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={preferences[field]}
          onChange={() => handleToggle(field)}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2c757c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c757c]"></div>
      </label>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#f0f9fa] flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#2c757c]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-500">Manage how SWARA alerts you.</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-2">
        <Toggle label="Check-in Reminders" desc="Receive a daily reminder to log your check-in." field="checkInReminders" />
        <Toggle label="Appointment Reminders" desc="Get notified before your scheduled appointments." field="appointmentReminders" />
        <Toggle label="Professional Messages" desc="Alerts when your care team sends you a message." field="professionalMessages" />
        <Toggle label="Weekly Summary" desc="A notification when your weekly insights report is ready." field="weeklySummary" />
        <Toggle label="Safety Notifications" desc="Critical alerts and SOS updates." field="safetyNotifications" />
      </div>
    </div>
  );
}
