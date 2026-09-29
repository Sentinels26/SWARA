import re

with open('frontend/src/pages/survivor/Profile.tsx', 'r') as f:
    content = f.read()

# Replace the layout
# We want to find the return ( ... ) block and replace it.
start_idx = content.find('  return (\n    <div className="min-h-screen')
if start_idx == -1:
    print("Could not find start of return block")
    exit(1)

new_return = """  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-col hidden md:flex sticky top-0 h-screen relative overflow-hidden shrink-0">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${displayAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5, filter: 'blur(10px)' }}></div>
        <div className="absolute inset-0 z-0 bg-white/70"></div>
        <div className="flex items-center gap-3 p-8 relative z-10">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <div className="font-bold text-xl text-slate-800 tracking-wider">SWARA</div>
        </div>
        <nav className="flex-1 py-4 px-6 flex flex-col gap-1 overflow-y-auto relative z-10">
          <Link to="/survivor/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Home className="w-5 h-5"/>{t('nav.home')}</Link>
          <Link to="/survivor/check-in" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><ClipboardCheck className="w-5 h-5"/>{t('nav.check_in')}</Link>
          <Link to="/survivor/journey" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><Activity className="w-5 h-5"/>{t('nav.journey')}</Link>
          <Link to="/survivor/support" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><HeartPulse className="w-5 h-5"/>{t('nav.support')}</Link>
          <Link to="/survivor/chat" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors"><MessageCircle className="w-5 h-5"/>{t('nav.messages')}</Link>
          <Link to="/survivor/profile" className="flex items-center gap-4 px-4 py-3.5 bg-[#e8f4f6] text-[#2c757c] font-semibold rounded-2xl"><User className="w-5 h-5"/>{t('nav.profile')}</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        {/* Mobile Header */}
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
        </header>

        <div className="flex-1 p-5 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
          
          {/* Desktop Top Nav */}
          <header className="hidden md:flex justify-end items-center mb-8 text-sm text-slate-500 gap-4">
            <button className="text-slate-400 hover:text-slate-600"><Search className="w-5 h-5" /></button>
            {!isRightMenuOpen && (
              <button onClick={() => setIsRightMenuOpen(true)} className="text-slate-400 hover:text-slate-600"><SettingsIcon className="w-5 h-5" /></button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#2c757c] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden ml-2">
               {profilePic ? <img src={imageError ? "/user.jpeg" : profilePic} alt="Avatar" className="w-full h-full object-cover" onError={handleImageError} /> : (user?.nickname?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
            </div>
          </header>

          <div className="hidden md:flex items-center justify-between mb-8">
            <h1 className="text-[1.75rem] font-bold text-[#1f2937] tracking-tight">Profile & Settings</h1>
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#2c757c] hover:bg-slate-50">
                <SettingsIcon className="w-5 h-5" />
            </button>
          </div>

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

          <div className="flex flex-col md:flex-row gap-8 w-full h-full">
            
            {/* Mobile Menu View */}
            <div className={`md:hidden ${mobileView === 'menu' ? 'block' : 'hidden'} w-full space-y-6`}>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                 <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={imageError ? "/user.jpeg" : displayAvatar} alt="Profile" className="w-full h-full object-cover" onError={handleImageError} />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{fullName}</h3>
                    <p className="text-sm text-slate-500">Survivor</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                 {menuItems.map(item => (
                   <button key={item.id} onClick={() => handleTabClick(item.id)} className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left group">
                      <div className="flex items-center gap-4 text-[#2c757c] font-semibold text-[15px]">
                         <item.icon className="w-5 h-5" />
                         <span className="text-slate-700">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                   </button>
                 ))}
                 <button className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-4 text-[#2c757c] font-semibold text-[15px]">
                       <User className="w-5 h-5" />
                       <span className="text-slate-700">Help & Support</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-4 text-[#2c757c] font-semibold text-[15px]">
                       <Shield className="w-5 h-5" />
                       <span className="text-slate-700">About SWARA</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                 </button>
              </div>
              
              <div className="mt-8">
                 <LogoutButton className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors border border-slate-100 shadow-sm w-full" />
              </div>
            </div>

            {/* Tab Content */}
            <div className={`flex-1 w-full ${mobileView === 'content' ? 'block' : 'hidden md:block'}`}>
            
            {/* Profile Content */}
            {activeTab === 'Profile' ? (
              <div className="flex flex-col md:flex-row gap-8 w-full">
                
                {/* Left Column (Profile Info) */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-sm shrink-0">
                            <img src={imageError ? "/user.jpeg" : displayAvatar} alt="Profile" className="w-full h-full object-cover" onError={handleImageError} />
                          </div>
                          {isEditing && (
                            <>
                              <input 
                                 type="file" 
                                 accept="image/jpeg, image/png, image/webp" 
                                 className="hidden" 
                                 ref={fileInputRef} 
                                 onChange={handleImageUpload} 
                              />
                              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm hover:text-[#2c757c] transition-colors">
                                <Camera className="w-4 h-4" />
                              </button>
                              {profilePic && (
                                 <button onClick={() => { setProfilePic(null); setImageError(false); }} className="absolute top-0 right-0 w-6 h-6 bg-red-100 border border-red-200 rounded-full flex items-center justify-center text-red-600 shadow-sm hover:bg-red-200 transition-colors" title="Remove Picture">
                                   <X className="w-3 h-3" />
                                 </button>
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <div className="space-y-2">
                               <input name="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-full max-w-[150px] focus:outline-none focus:border-[#2c757c]" />
                            </div>
                          ) : (
                            <>
                              <h2 className="text-xl font-bold text-slate-800">{fullName || 'User Name'}</h2>
                              <div className="text-slate-500">Survivor</div>
                            </>
                          )}
                        </div>
                      </div>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="px-5 py-2 text-sm font-bold bg-[#e8f4f6] text-[#2c757c] rounded-full hover:bg-[#d4ecef] transition-colors">
                          View Details
                        </button>
                      ) : (
                         <div className="flex gap-2">
                            <button onClick={cancelEdit} className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-4 h-4"/></button>
                            <button onClick={saveChanges} className="p-2 text-white bg-[#2c757c] rounded-full hover:bg-[#1f595e]"><Save className="w-4 h-4"/></button>
                         </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Mail className="w-5 h-5"/></div>
                          <div>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
                              <div className="text-sm font-medium text-slate-800">{user?.email || 'N/A'}</div>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Phone className="w-5 h-5"/></div>
                          <div>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Phone</div>
                              {isEditing ? (
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-800 focus:outline-none w-full max-w-[150px]" />
                              ) : (
                                <div className="text-sm font-medium text-slate-800">{phone || '+91 98765 43210'}</div>
                              )}
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Globe className="w-5 h-5"/></div>
                          <div>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Language</div>
                              {isEditing ? (
                                <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-800 focus:outline-none w-full max-w-[150px]">
                                   <option value="English">English</option>
                                   <option value="Hindi">Hindi</option>
                                </select>
                              ) : (
                                <div className="text-sm font-medium text-slate-800">{preferredLanguage || 'English'}</div>
                              )}
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Toggle (Desktop) */}
                  <div className="hidden md:block bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
                      <h3 className="font-bold text-slate-800 mb-4">Theme</h3>
                      <div className="flex p-1 bg-slate-100 rounded-full relative">
                          <button onClick={() => setTheme('light')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-full z-10 transition-colors ${theme === 'light' || theme === 'system' ? 'text-white bg-[#2c757c] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                              Light
                          </button>
                          <button onClick={() => setTheme('dark')} className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-full z-10 transition-colors ${theme === 'dark' ? 'text-white bg-[#2c757c] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                              Dark
                          </button>
                      </div>
                  </div>
                </div>

                {/* Right Column (Settings Lists - Desktop) */}
                <div className="hidden md:flex w-1/2 flex-col gap-6">
                    {/* Quick Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
                        <h3 className="font-bold text-slate-800 mb-6">Quick Settings</h3>
                        <div className="space-y-2">
                            <button onClick={() => handleTabClick('Notifications')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><Bell className="w-5 h-5"/></div>
                                    Notification Preferences
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                            <button onClick={() => handleTabClick('Accessibility')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><Activity className="w-5 h-5"/></div>
                                    Accessibility Settings
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                            <button onClick={() => handleTabClick('Security')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><Shield className="w-5 h-5"/></div>
                                    Change Password
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                            <button onClick={() => handleTabClick('Security')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><Shield className="w-5 h-5"/></div>
                                    Two-Factor Authentication
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                    </div>

                    {/* Privacy Center */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
                        <h3 className="font-bold text-slate-800 mb-6">Privacy Center</h3>
                        <div className="space-y-2">
                            <button onClick={() => handleTabClick('Privacy')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><Shield className="w-5 h-5"/></div>
                                    Data & Consent
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-slate-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white"><ClipboardCheck className="w-5 h-5"/></div>
                                    Download My Data
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-4 text-red-600 font-medium">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-white"><User className="w-5 h-5"/></div>
                                    Delete My Account
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-300" />
                            </button>
                        </div>
                    </div>
                </div>

              </div>
            ) : (
              <div className="w-full bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
                 {activeTab === 'Privacy' && <PrivacySettings />}
                 {activeTab === 'Accessibility' && <AccessibilitySettings />}
                 {activeTab === 'Security' && <SecuritySettings />}
                 {activeTab === 'Notifications' && <NotificationSettings />}
              </div>
            )}
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around p-3 z-50 shadow-[0_-4px_10px_rgb(0,0,0,0.02)] pb-safe">
        <Link to="/survivor/dashboard" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Home className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/survivor/journey" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <Activity className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Journey</span>
        </Link>
        <Link to="/survivor/support" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600">
          <HeartPulse className="w-5 h-5"/>
          <span className="text-[10px] font-medium">Support</span>
        </Link>
        <Link to="/survivor/profile" className="flex flex-col items-center gap-1.5 text-[#2c757c]">
          <User className="w-5 h-5"/>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>

    </div>
  );
}
"""

with open('frontend/src/pages/survivor/Profile.tsx', 'w') as f:
    f.write(content[:start_idx] + new_return)

print("Done")
