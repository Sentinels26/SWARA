// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Home as HomeIcon, Users, Bell, Calendar, FileText, User, 
    ShieldAlert, ChevronRight, Settings, Mail, Phone, MapPin, 
    Globe, Lock, Shield, Menu, X, BookOpen, Activity, ChevronLeft, ShieldCheck,
    CheckCircle2, BellRing, Eye, Activity as ActivityIcon, Fingerprint, LockKeyhole,
    TextSearch, Type, Expand, Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutButton } from '../../components/LogoutButton';

export default function ProfessionalProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const tabs = ['Profile', 'Privacy', 'Notifications', 'Accessibility', 'Security'];

  const renderTabContent = () => {
    switch (activeTab) {
        case 'Profile':
            return (
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    {/* Left Column (Profile Info) */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        
                        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl lg:text-3xl shadow-sm border border-slate-200 shrink-0">
                                        {user?.full_name ? user.full_name[0] : 'P'}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg lg:text-xl text-slate-800 leading-tight">{user?.full_name || 'Prayaash Singh'}</h2>
                                        <div className="text-slate-500 text-sm capitalize mt-0.5">{user?.role?.toLowerCase() || 'Professional'}</div>
                                    </div>
                                </div>
                                <button className="px-5 py-2 text-xs lg:text-sm font-bold bg-[#e8f4f6] text-[#2c757c] rounded-full hover:bg-[#d4ecef] transition-colors whitespace-nowrap self-start sm:self-auto">
                                    View Details
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Mail className="w-5 h-5"/></div>
                                    <div className="pt-1">
                                        <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
                                        <div className="text-sm font-medium text-slate-800 break-all">{user?.email || 'prayaashsinghxyz@gmail.com'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Phone className="w-5 h-5"/></div>
                                    <div className="pt-1">
                                        <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</div>
                                        <div className="text-sm font-medium text-slate-800">+91 98765 43210</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin className="w-5 h-5"/></div>
                                    <div className="pt-1">
                                        <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</div>
                                        <div className="text-sm font-medium text-slate-800">Jaipur, Rajasthan</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Globe className="w-5 h-5"/></div>
                                    <div className="pt-1">
                                        <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Language</div>
                                        <div className="text-sm font-medium text-slate-800">English</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Quick Settings) */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        
                        {/* Quick Settings */}
                        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6">Quick Settings</h3>
                            <div className="space-y-1">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4 text-slate-600 font-medium text-sm lg:text-base">
                                        <BellRing className="w-5 h-5 text-slate-400 group-hover:text-[#2c757c] transition-colors"/>
                                        Notification Preferences
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4 text-slate-600 font-medium text-sm lg:text-base">
                                        <User className="w-5 h-5 text-slate-400 group-hover:text-[#2c757c] transition-colors"/>
                                        Accessibility Settings
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4 text-slate-600 font-medium text-sm lg:text-base">
                                        <LockKeyhole className="w-5 h-5 text-slate-400 group-hover:text-[#2c757c] transition-colors"/>
                                        Change Password
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4 text-slate-600 font-medium text-sm lg:text-base">
                                        <Shield className="w-5 h-5 text-slate-400 group-hover:text-[#2c757c] transition-colors"/>
                                        Two-Factor Authentication
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Privacy Center */}
                        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-6">Privacy Center</h3>
                            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium text-sm lg:text-base">
                                    <ShieldAlert className="w-5 h-5 text-slate-400 group-hover:text-[#2c757c] transition-colors"/>
                                    Manage your data and privacy settings
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                            </button>
                        </div>

                    </div>
                </div>
            );
        case 'Privacy':
            return (
                <div className="flex flex-col gap-6 w-full">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Data & Privacy</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm mb-1">Data Sharing</div>
                                    <div className="text-slate-500 text-xs font-medium">Manage what data can be shared with others.</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Enabled</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm mb-1">Account Visibility</div>
                                    <div className="text-slate-500 text-xs font-medium">Control who can view your profile and activity.</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Only Me</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm mb-1">Analytics & Usage</div>
                                    <div className="text-slate-500 text-xs font-medium">Help us improve by sharing anonymous usage data.</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Disabled</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Consent Management</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <div className="pr-4">
                                    <div className="font-bold text-slate-800 text-sm mb-1">Research Participation</div>
                                    <div className="text-slate-500 text-xs font-medium">Allow participation in research and improvement studies.</div>
                                </div>
                                {/* Mock Toggle */}
                                <div className="w-10 h-6 bg-[#2c757c] rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm mb-1">Third-Party Integrations</div>
                                    <div className="text-slate-500 text-xs font-medium">Manage connected services and permissions.</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'Notifications':
            return (
                <div className="flex flex-col gap-6 w-full">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Notification Preferences</h3>
                        <p className="text-slate-500 text-xs font-medium mb-6">Choose how you want to receive alerts and updates.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <div className="pr-4">
                                    <div className="font-bold text-slate-800 text-sm mb-1">Email Notifications</div>
                                    <div className="text-slate-500 text-xs font-medium">Important updates, reports and system alerts.</div>
                                </div>
                                {/* Mock Toggle ON */}
                                <div className="w-10 h-6 bg-[#2c757c] rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div className="pr-4">
                                    <div className="font-bold text-slate-800 text-sm mb-1">Push Notifications</div>
                                    <div className="text-slate-500 text-xs font-medium">Real-time alerts and reminders.</div>
                                </div>
                                {/* Mock Toggle ON */}
                                <div className="w-10 h-6 bg-[#2c757c] rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div className="pr-4">
                                    <div className="font-bold text-slate-800 text-sm mb-1">SMS Notifications</div>
                                    <div className="text-slate-500 text-xs font-medium">Critical alerts and emergency messages.</div>
                                </div>
                                {/* Mock Toggle OFF */}
                                <div className="w-10 h-6 bg-slate-200 rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Alert Types</h3>
                        <p className="text-slate-500 text-xs font-medium mb-6">Select the types of alerts you want to receive.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {['System Alerts', 'Case Updates', 'Appointments', 'Safety Alerts'].map(type => (
                                <div key={type} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-5 h-5 rounded border-2 border-[#2c757c] bg-[#2c757c] flex items-center justify-center shrink-0">
                                        <div className="w-2.5 h-2.5 bg-white scale-[0.8] clip-path-check" style={{clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)'}}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'Accessibility':
            return (
                <div className="flex flex-col gap-6 w-full">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Display & Readability</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <Type className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm mb-1">Text Size</div>
                                        <div className="text-slate-500 text-xs font-medium hidden sm:block">Adjust the size of text in the app.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">Medium</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div className="flex items-start gap-4 pr-4">
                                    <Moon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm mb-1">High Contrast Mode</div>
                                        <div className="text-slate-500 text-xs font-medium">Improve visibility with high contrast colors.</div>
                                    </div>
                                </div>
                                {/* Mock Toggle OFF */}
                                <div className="w-10 h-6 bg-slate-200 rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div className="flex items-start gap-4 pr-4">
                                    <Expand className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm mb-1">Reduce Motion</div>
                                        <div className="text-slate-500 text-xs font-medium">Minimize animations and motion effects.</div>
                                    </div>
                                </div>
                                {/* Mock Toggle OFF */}
                                <div className="w-10 h-6 bg-slate-200 rounded-full relative shrink-0">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Language & Region</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <Globe className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm mb-1">Language</div>
                                        <div className="text-slate-500 text-xs font-medium hidden sm:block">Choose your preferred language.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600">English (IN)</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-t border-slate-50">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm mb-1">Region</div>
                                        <div className="text-slate-500 text-xs font-medium hidden sm:block">Set your region for accurate time and content.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600">India</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'Security':
            return (
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Account Security */}
                        <div className="w-full lg:w-3/5 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg mb-6">Account Security</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50 gap-4">
                                    <div className="flex items-start gap-4">
                                        <LockKeyhole className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-1">Change Password</div>
                                            <div className="text-slate-500 text-xs font-medium">Update your password regularly for better security.</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#2c757c] self-start sm:self-center ml-9 sm:ml-0 cursor-pointer hover:underline">Update</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50 gap-4">
                                    <div className="flex items-start gap-4">
                                        <Shield className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-1">Two-Factor Authentication</div>
                                            <div className="text-slate-500 text-xs font-medium">Add an extra layer of security to your account.</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full self-start sm:self-center ml-9 sm:ml-0">Enabled</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50 gap-4">
                                    <div className="flex items-start gap-4">
                                        <ActivityIcon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-1">Login Activity</div>
                                            <div className="text-slate-500 text-xs font-medium">View recent logins and active sessions.</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#2c757c] self-start sm:self-center ml-9 sm:ml-0 cursor-pointer hover:underline">View</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="w-full lg:w-2/5 bg-green-50/50 rounded-3xl p-6 lg:p-8 shadow-sm border border-green-100 flex flex-col justify-center">
                            <h3 className="font-bold text-green-800 text-lg mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Security Tips
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold text-green-700 leading-relaxed">Use a strong, unique password</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold text-green-700 leading-relaxed">Enable two-factor authentication</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold text-green-700 leading-relaxed">Keep your recovery email updated</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold text-green-700 leading-relaxed">Avoid sharing your login details</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-slate-50" style={{ backgroundImage: "url('/bgall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      
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
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 overflow-x-hidden relative z-10">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 font-medium rounded-lg transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-3 px-3 py-2 text-sm bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-lg transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 font-medium rounded-lg transition-colors w-full whitespace-nowrap text-left" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto pb-24 md:pb-4 relative">
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 mt-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        Profile & Settings
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-medium md:ml-10">
                        {activeTab === 'Profile' && 'View and manage your personal information.'}
                        {activeTab === 'Privacy' && "Control what data you share and how it's used."}
                        {activeTab === 'Notifications' && 'Manage your alerts and system notifications.'}
                        {activeTab === 'Accessibility' && 'Make the app work better for you.'}
                        {activeTab === 'Security' && 'Keep your account safe and secure.'}
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-green-50/50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                    <ShieldCheck className="w-4 h-4" /> Secure & Encrypted
                </div>
            </div>

            {/* Tabs (Responsive) */}
            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200/50 mb-6 w-full -mx-4 px-4 md:mx-0 md:px-0">
                {tabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 text-sm font-bold whitespace-nowrap transition-colors relative
                            ${activeTab === tab 
                                ? 'text-[#2c757c]' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#2c757c] rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="w-full">
                {renderTabContent()}
            </div>
            
            {/* Logout button at bottom of profile for mobile */}
            {activeTab === 'Profile' && (
                <div className="md:hidden mt-6 mb-4 px-1">
                    <LogoutButton className="w-full py-4 text-center text-red-600 font-bold bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-red-50 transition-colors" />
                </div>
            )}

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
        <Link to="/professional/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <HomeIcon className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/professional/cases" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Users className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Cases</span>
        </Link>
        <Link to="/professional/alerts" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600 relative">
          <div className="relative">
            <Bell className="w-5 h-5"/>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>
        <Link to="/professional/profile" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <User className="w-5 h-5"/>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
