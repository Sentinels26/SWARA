import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, Lock, Laptop, CheckCircle, X, Loader2 } from 'lucide-react';
import { LogoutButton } from '../LogoutButton';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    
    // Simulate secure API call without logging plaintext password
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out of all other sessions?")) {
      setMessage({ type: 'success', text: 'Successfully logged out of all other sessions.' });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#f0f9fa] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#2c757c]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Security</h2>
          <p className="text-sm text-slate-500">Manage your password and active sessions.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        
        {/* Password Change */}
        <div>
          <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Current Password</label>
              <Input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-800 focus:border-[#2c757c] focus:bg-white transition-colors"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">New Password</label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-800 focus:border-[#2c757c] focus:bg-white transition-colors"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Confirm New Password</label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-800 focus:border-[#2c757c] focus:bg-white transition-colors"
                autoComplete="new-password"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={isSaving} className="bg-[#2c757c] hover:bg-[#1f595e] text-white">
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-400" /> Active Sessions
          </h3>
          
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-slate-800">Current Session</p>
                   <p className="text-xs text-slate-500">Mac OS • Chrome • India</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</div>
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <Button variant="outline" onClick={handleLogoutAll} className="border-slate-200 text-slate-600 hover:bg-slate-50">
               Log out of other sessions
             </Button>
             <LogoutButton text="Log out of current session" className="flex items-center justify-center gap-2 h-10 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md font-medium text-sm transition-colors" />
          </div>
        </div>

      </div>
    </div>
  );
}
