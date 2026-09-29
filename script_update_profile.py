import re

with open('/Users/macbookair/Documents/swara1/frontend/src/pages/survivor/Profile.tsx', 'r') as f:
    content = f.read()

# Add imports for ChevronRight and SettingsIcon
content = content.replace(
    "import { Home, ClipboardCheck, MessageCircle, HeartPulse, User, Bell, Activity, ArrowLeft, Mail, Phone, Globe, Shield, Search, Camera, X, CheckCircle, Save, Loader2 } from 'lucide-react';",
    "import { Home, ClipboardCheck, MessageCircle, HeartPulse, User, Bell, Activity, ArrowLeft, Mail, Phone, Globe, Shield, Search, Camera, X, CheckCircle, Save, Loader2, ChevronRight, Settings as SettingsIcon } from 'lucide-react';"
)

# Add State variables
state_vars = """  const [activeTab, setActiveTab] = useState('Profile');
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu');
  
  const menuItems = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Privacy', label: 'Privacy & Consent', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Accessibility', label: 'Accessibility', icon: Activity },
    { id: 'Security', label: 'Security', icon: Shield }
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setMobileView('content');
    }
  };
"""
content = re.sub(r'const \[activeTab, setActiveTab\] = useState\(\'Profile\'\);', state_vars, content)


# Replace Mobile Header
mobile_header_orig = """        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <button onClick={() => navigate('/survivor/dashboard')} className="p-2 text-[#2c757c]"><ArrowLeft className="w-5 h-5"/></button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 tracking-wide">{t('profile.title')}</span>
          </div>
          <button className="p-2 text-slate-400"><Search className="w-5 h-5"/></button>
        </header>"""

mobile_header_new = """        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          {mobileView === 'content' ? (
            <button onClick={() => setMobileView('menu')} className="p-2 text-[#2c757c]"><ArrowLeft className="w-5 h-5"/></button>
          ) : (
            <button onClick={() => navigate('/survivor/dashboard')} className="p-2 text-[#2c757c]"><ArrowLeft className="w-5 h-5"/></button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 tracking-wide">{mobileView === 'content' ? activeTab : 'Settings'}</span>
          </div>
          <button className="p-2 text-slate-400"><Search className="w-5 h-5"/></button>
        </header>"""
content = content.replace(mobile_header_orig, mobile_header_new)

# Replace top nav and desktop tabs
desktop_nav_orig = """          {/* Desktop Top Nav */}
          <header className="hidden md:flex justify-end items-center mb-8 text-sm text-slate-500 gap-6">
            <button className="text-slate-400 hover:text-slate-600"><Search className="w-5 h-5" /></button>
            <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
               {profilePic ? <img src={imageError ? "/user.jpeg" : profilePic} alt="Avatar" className="w-full h-full object-cover" onError={handleImageError} /> : (user?.nickname?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
            </div>
          </header>

          <h1 className="text-2xl md:text-3xl font-bold text-[#1f2937] mb-6 md:mb-8 hidden md:block">{t('profile.title')}</h1>

          {/* Tabs */}
          <div className="flex gap-4 md:gap-8 mb-8 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            {['Profile', 'Privacy', 'Notifications', 'Accessibility', 'Security'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === tab ? 'text-[#2c757c]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'Profile' && <User className="w-4 h-4" />}
                {tab === 'Privacy' && <Shield className="w-4 h-4" />}
                {tab === 'Notifications' && <Bell className="w-4 h-4" />}
                {tab === 'Accessibility' && <Activity className="w-4 h-4" />}
                {tab === 'Security' && <Shield className="w-4 h-4" />}
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2c757c] rounded-t-full"></div>}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">"""

desktop_nav_new = """          {/* Desktop Top Nav */}
          <header className="hidden md:flex justify-end items-center mb-8 text-sm text-slate-500 gap-4">
            <button className="text-slate-400 hover:text-slate-600"><Search className="w-5 h-5" /></button>
            {!isRightMenuOpen && (
              <button onClick={() => setIsRightMenuOpen(true)} className="text-slate-400 hover:text-slate-600"><SettingsIcon className="w-5 h-5" /></button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden ml-2">
               {profilePic ? <img src={imageError ? "/user.jpeg" : profilePic} alt="Avatar" className="w-full h-full object-cover" onError={handleImageError} /> : (user?.nickname?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
            </div>
          </header>

          <h1 className="text-2xl md:text-3xl font-bold text-[#1f2937] mb-6 md:mb-8 hidden md:block">{t('profile.title')}</h1>

          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-4 md:gap-8 mb-8 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            {menuItems.map(tab => (
              <button 
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-[#2c757c]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2c757c] rounded-t-full"></div>}
              </button>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full">
            
            {/* Mobile Menu View */}
            <div className={`md:hidden ${mobileView === 'menu' ? 'block' : 'hidden'} w-full`}>
              <div className="bg-white rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-sm border border-slate-100">
                 <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={imageError ? "/user.jpeg" : displayAvatar} alt="Profile" className="w-full h-full object-cover" onError={handleImageError} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 text-lg">{fullName}</h3>
                    <p className="text-sm text-slate-500">Survivor</p>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 {menuItems.map(item => (
                   <button key={item.id} onClick={() => handleTabClick(item.id)} className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                         <item.icon className="w-5 h-5 text-slate-400" />
                         <span className="font-semibold text-slate-700">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                   </button>
                 ))}
              </div>
              
              <div className="mt-8">
                 <LogoutButton className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-xl transition-colors border border-red-100 w-full" />
              </div>
            </div>

            {/* Tab Content */}
            <div className={`flex-1 w-full max-w-3xl ${mobileView === 'content' ? 'block' : 'hidden md:block'}`}>"""
content = content.replace(desktop_nav_orig, desktop_nav_new)


# Remove mobile only logout since we added it to menu
content = content.replace("""                {/* Mobile Only Logout */}
                <div className="md:hidden mt-6">
                  <LogoutButton className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-xl transition-colors border border-red-100 w-full" />
                </div>""", "")


# Add Right Menu at the end of tab content
right_menu = """            </div>

            {/* Right Menu / Quick Settings (Desktop Only) */}
            {isRightMenuOpen && (
              <div className="hidden xl:block w-80 shrink-0">
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50 relative sticky top-8">
                  <button onClick={() => setIsRightMenuOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors" title="Close Menu">
                    <X className="w-4 h-4" />
                  </button>
                  
                  <h3 className="font-bold text-slate-800 mb-4">Quick Settings</h3>
                  <div className="space-y-1 mb-8">
                     <button onClick={() => handleTabClick('Notifications')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#2c757c]">
                           <Bell className="w-4 h-4 text-slate-400 group-hover:text-[#2c757c]" /> Notification Preferences
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                     <button onClick={() => handleTabClick('Accessibility')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#2c757c]">
                           <Activity className="w-4 h-4 text-slate-400 group-hover:text-[#2c757c]" /> Accessibility Settings
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                     <button onClick={() => handleTabClick('Security')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#2c757c]">
                           <Shield className="w-4 h-4 text-slate-400 group-hover:text-[#2c757c]" /> Change Password
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                  </div>

                  <h3 className="font-bold text-slate-800 mb-4">Privacy Center</h3>
                  <div className="space-y-1">
                     <button onClick={() => handleTabClick('Privacy')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#2c757c]">
                           <Shield className="w-4 h-4 text-slate-400 group-hover:text-[#2c757c]" /> Data & Consent
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                     <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#2c757c]">
                           <ClipboardCheck className="w-4 h-4 text-slate-400 group-hover:text-[#2c757c]" /> Download My Data
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                  </div>
                </div>
              </div>
            )}
"""

content = content.replace("          </div>\n        </div>\n      </main>", right_menu + "          </div>\n        </div>\n      </main>")

with open('/Users/macbookair/Documents/swara1/frontend/src/pages/survivor/Profile.tsx', 'w') as f:
    f.write(content)
