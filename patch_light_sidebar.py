import os
import glob
import re

new_aside = """      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-100 flex-col sticky top-0 h-screen overflow-y-auto hidden md:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} shrink-0 z-50 relative overflow-hidden`}>
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
          <Link to="/professional/dashboard" title="Home" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><HomeIcon className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Home'}</Link>
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 overflow-x-hidden relative z-10">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:bg-slate-50 font-medium rounded-2xl transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:bg-slate-50 font-medium rounded-2xl transition-colors w-full whitespace-nowrap text-left" />
          </div>
        </div>
      </aside>"""

def replace_aside(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Regex to find the <aside>...</aside> block
    # It might have newlines, so we use DOTALL
    # We find the FIRST aside.
    aside_pattern = re.compile(r'<aside.*?</aside>', re.DOTALL)
    
    if aside_pattern.search(content):
        # We need to make sure we don't just blindly replace, but let's just do it.
        # But wait, we might want to highlight the active link. 
        # I can do a simple string replacement for the current page link to make it active.
        
        filename = os.path.basename(filepath)
        active_class = 'bg-[#e8f4f6] text-[#2c757c] font-semibold'
        inactive_class = 'text-slate-500 hover:bg-slate-50 font-medium'
        
        custom_aside = new_aside
        
        if filename == 'Home.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/dashboard" title="Home" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/dashboard" title="Home" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Cases.tsx' or filename == 'CaseWorkspace.tsx' or filename == 'CaseDetail.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/cases" title="Cases" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/cases" title="Cases" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Alerts.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/alerts" title="Safety Queue" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/alerts" title="Safety Queue" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Appointments.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/appointments" title="Appointments" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/appointments" title="Appointments" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Reports.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/reports" title="Reports" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/reports" title="Reports" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Referral.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/referral" title="Add Case" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/referral" title="Add Case" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'AuditActivity.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/audit" title="Activity & Audit" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/audit" title="Activity & Audit" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Settings.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/settings" title="Settings" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/settings" title="Settings" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        elif filename == 'Profile.tsx':
            custom_aside = custom_aside.replace(f'to="/professional/profile" title="Profile" className="flex items-center gap-4 px-4 py-3.5 {inactive_class}', f'to="/professional/profile" title="Profile" className="flex items-center gap-4 px-4 py-3.5 {active_class}')
        
        new_content = aside_pattern.sub(custom_aside.replace('\\', '\\\\'), content, count=1)
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Replaced aside in {filepath}")
    else:
        print(f"Could not find <aside> in {filepath}")

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    replace_aside(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    replace_aside(filepath)
