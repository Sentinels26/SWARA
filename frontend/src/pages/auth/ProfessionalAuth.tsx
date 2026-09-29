import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowRight, Lock, Activity, User, Mail, Stethoscope } from 'lucide-react';
import api from '../../api';
import { Input } from '../../components/ui/Input';

export default function ProfessionalAuth() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('');
  
  // UX State
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!isLoading && user) {
    if (user.role === 'PROFESSIONAL') {
      return <Navigate to="/professional/dashboard" replace />;
    } else {
      return <Navigate to="/survivor/dashboard" replace />;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const userRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      
      if (userRes.data.role === 'PROFESSIONAL') {
        const u = userRes.data;
        const fullName = u.professional_profile?.full_name || u.email;
        login(res.data.access_token, { id: u.id, email: u.email, role: u.role, full_name: fullName });
        setSuccess('Success');
        navigate('/professional/dashboard', { replace: true });
      } else {
        setError('This account is not a professional account.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid credentials');
      } else if (!err.response) {
        setError('Network/API error');
      } else {
        setError(err.response?.data?.detail || 'Login failed');
      }
      setIsSubmitting(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await api.post('/api/auth/register', {
        email,
        password,
        role: 'PROFESSIONAL',
        full_name: fullName,
        specialization,
      });
      
      if (res.data) {
        setSuccess('Registration successful. You can now login.');
        setIsLogin(true);
        setStep(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div 
      className="min-h-screen flex w-full relative" 
      style={{ 
        backgroundImage: 'url(/bg-screen.jpeg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Optional subtle overlay to ensure text readability on all screens */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      {/* LEFT SIDE - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative text-center items-center py-16 px-12 z-10">

        <div className="relative z-10 flex flex-col items-center mt-10">
          <div className="mb-4">
            <img src="/logo.png" alt="SWARA Logo" className="w-24 h-24 object-contain drop-shadow-md rounded-2xl bg-white p-2" />
          </div>
          <h1 className="text-[2.75rem] font-medium text-slate-800 tracking-wider mb-6" style={{ letterSpacing: '0.2em' }}>SWARA</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2 drop-shadow-sm">Empowering professionals.</h2>
          <h2 className="text-2xl font-semibold text-slate-800 mb-8 drop-shadow-sm">Actionable intelligence.</h2>
          
          <p className="text-slate-700 max-w-sm text-sm leading-relaxed font-medium drop-shadow-sm">
            SWARA provides AI-assisted support prioritization, not clinical diagnosis. Ensure your caseload is effectively triaged through continuous longitudinal monitoring.
          </p>
        </div>

        {/* Feature Icons Bottom */}
        <div className="flex justify-between w-full max-w-md mt-auto relative z-10 pt-12">
          <div className="flex flex-col items-center text-center">
            <Shield className="w-6 h-6 text-slate-700 mb-3" />
            <span className="text-sm font-semibold text-slate-900 drop-shadow-sm">HIPAA & GDPR</span>
            <span className="text-[10px] text-slate-700 mt-1 font-medium drop-shadow-sm">Aligned protocol.</span>
          </div>
          <div className="w-px h-12 bg-slate-400"></div>
          <div className="flex flex-col items-center text-center">
            <Activity className="w-6 h-6 text-slate-700 mb-3" />
            <span className="text-sm font-semibold text-slate-900 drop-shadow-sm">Longitudinal</span>
            <span className="text-[10px] text-slate-700 mt-1 font-medium drop-shadow-sm">Continuous monitoring.</span>
          </div>
          <div className="w-px h-12 bg-slate-400"></div>
          <div className="flex flex-col items-center text-center">
            <Stethoscope className="w-6 h-6 text-slate-700 mb-3" />
            <span className="text-sm font-semibold text-slate-900 drop-shadow-sm">Triage Priority</span>
            <span className="text-[10px] text-slate-700 mt-1 font-medium drop-shadow-sm">Identify risk instantly.</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        
        {/* Floating Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 p-10 w-full max-w-md">
          
          {/* Registration Flow Progress */}
          {!isLogin && (
            <div className="mb-10">
              <div className="text-xs font-bold text-slate-400 tracking-wider mb-3">STEP {step} OF 2</div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3c848c] transition-all duration-500 ease-out" style={{ width: step === 1 ? '50%' : '100%' }}></div>
              </div>
            </div>
          )}

          {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">{error}</div>}
          {success && <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-lg font-medium text-center">{success}</div>}

          {/* IS LOGIN */}
          {isLogin ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-6 shadow-sm">
                <Stethoscope className="w-5 h-5 text-[#3c848c]" />
              </div>
              <h2 className="text-[1.75rem] font-semibold text-slate-800 mb-4 leading-tight">Professional Portal</h2>
              <p className="text-sm text-slate-500 mb-8 px-4">Sign in to manage your caseload.</p>
              
              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input id="input_4f5c2609" name="input_4f5c2609" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Professional Email"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#3c848c] focus:ring-1 focus:ring-[#3c848c] transition-all"
                    required 
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="pl-11 bg-white border-slate-200 rounded-xl text-sm focus:border-[#3c848c] focus:ring-[#3c848c] py-3.5 h-auto transition-all"
                    required 
                  />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-[#3c848c] hover:bg-[#316c73] disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                  {isSubmitting ? 'Signing in...' : success ? 'Success' : error ? 'Error' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="flex items-center w-full my-8">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="text-xs text-slate-500">
                Are you a new professional?<br/>
                <button type="button" onClick={() => setIsLogin(false)} className="text-[#3c848c] mt-1 hover:underline font-bold">Request Access Here.</button>
              </div>
            </div>
          ) : (
            /* IS REGISTER */
            <div className="flex flex-col items-center text-center">
              
              {step === 1 ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-6 shadow-sm">
                    <User className="w-5 h-5 text-[#3c848c]" />
                  </div>
                  <h2 className="text-[1.75rem] font-semibold text-slate-800 mb-4 leading-tight">Professional<br/>Registration</h2>
                  <p className="text-sm text-slate-500 mb-8 px-4">Provide your clinical details for verification.</p>
                  
                  <form onSubmit={handleRegisterStep1} className="w-full space-y-4">
                    <input id="input_ce4d8bf4" name="input_ce4d8bf4" 
                      type="text" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Full Name (e.g. Dr. Jane Doe)"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#3c848c] focus:ring-1 focus:ring-[#3c848c] transition-all"
                      required 
                    />
                    <input id="input_b9507c2b" name="input_b9507c2b" 
                      type="text" 
                      value={specialization} 
                      onChange={(e) => setSpecialization(e.target.value)} 
                      placeholder="Specialization (e.g. Clinical Psychologist)"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#3c848c] focus:ring-1 focus:ring-[#3c848c] transition-all"
                      required 
                    />
                    
                    <button type="submit" className="w-full py-3.5 bg-[#3c848c] hover:bg-[#316c73] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-6 shadow-sm">
                    <Lock className="w-5 h-5 text-[#3c848c]" />
                  </div>
                  <h2 className="text-[1.75rem] font-semibold text-slate-800 mb-4 leading-tight">Account Security</h2>
                  <p className="text-sm text-slate-500 mb-8 px-4">Set up your secure login credentials.</p>
                  
                  <form onSubmit={handleRegisterStep2} className="w-full space-y-4">
                    <input id="input_540cc16c" name="input_540cc16c" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Professional Email"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#3c848c] focus:ring-1 focus:ring-[#3c848c] transition-all"
                      required 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"
                        className="bg-white border-slate-200 rounded-xl text-sm focus:border-[#3c848c] focus:ring-[#3c848c] py-3.5 h-auto transition-all"
                        required 
                      />
                      <Input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm"
                        className="bg-white border-slate-200 rounded-xl text-sm focus:border-[#3c848c] focus:ring-[#3c848c] py-3.5 h-auto transition-all"
                        required 
                      />
                    </div>
                    
                    <button type="submit" className="w-full py-3.5 bg-[#3c848c] hover:bg-[#316c73] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                      Register Account <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-600 mt-4 underline">Back</button>
                  </form>
                </>
              )}

              <div className="flex items-center w-full my-8">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="text-xs text-slate-500">
                Already registered?<br/>
                <button type="button" onClick={() => setIsLogin(true)} className="text-[#3c848c] mt-1 hover:underline font-bold">Log in to your portal.</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
