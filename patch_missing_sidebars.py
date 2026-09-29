import os
import glob
import re

new_aside = """      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex-col sticky top-0 h-screen overflow-y-auto hidden md:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} shrink-0 z-50 relative overflow-hidden`}>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url(/user.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}></div>
        <div className="absolute inset-0 z-0 bg-slate-900/80"></div>
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800 relative z-10">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-md bg-white p-1" />
            <div className="font-bold text-2xl text-white tracking-tight">SWARA</div>
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute right-4 top-8 text-slate-400 hover:text-white transition-colors z-20">
            {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-x-hidden relative z-10">
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Main</div>}
          <Link to="/professional/dashboard" title="Home" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><HomeIcon className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Home'}</Link>
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800 overflow-x-hidden relative z-10">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-colors w-full whitespace-nowrap" />
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
"""

required_icons = ['Home as HomeIcon', 'Users', 'ShieldAlert', 'Calendar', 'FileText', 'BookOpen', 'Activity', 'Settings', 'User', 'Menu', 'X']

def update_file(filepath):
    print(f"Checking {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    if '<aside' in content:
        print(f"Skipping {filepath} - already has aside")
        return
        
    print(f"Injecting aside into {filepath}")

    # Find the top level <div className="min-h-screen ...">
    div_match = re.search(r'<div\s+className="min-h-screen[^>]+>', content)
    if not div_match:
        print(f"Could not find top level div in {filepath}")
        return
        
    # Replace the top level div to have flex-col md:flex-row
    div_content = div_match.group(0)
    # remove p-6 md:p-10 and flex-col
    div_content = div_content.replace(' p-6 md:p-10', '')
    if 'md:flex-row' not in div_content:
        div_content = div_content.replace('flex-col', 'flex-col md:flex-row')
        
    content = content[:div_match.start()] + div_content + '\n' + new_aside + content[div_match.end():]
    
    # We need to close the <main> tag just before the last </div>
    last_div = content.rfind('</div>')
    if last_div != -1:
        content = content[:last_div] + '      </main>\n    ' + content[last_div:]

    # Add state
    match = re.search(r'const\s+(?:\[.*?\]|navigate|\w+)\s*=\s*(?:useNavigate|useState|useAuth)\(.*?\);', content)
    if match:
        if 'useState' not in content:
            react_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'react'", content)
            if react_match:
                if 'useState' not in react_match.group(1):
                    content = content.replace(react_match.group(0), f"import {{ {react_match.group(1)}, useState }} from 'react'")
            else:
                content = "import { useState } from 'react';\n" + content
        content = content[:match.end()] + "\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);" + content[match.end():]

    # Add required lucide icons
    lucide_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'lucide-react'", content)
    if lucide_match:
        existing_imports = [i.strip() for i in lucide_match.group(1).split(',')]
        existing_bases = []
        for i in existing_imports:
            if ' as ' in i:
                existing_bases.append(i.split(' as ')[0].strip())
                existing_bases.append(i)
            else:
                existing_bases.append(i)

        for icon in required_icons:
            if icon not in existing_bases and icon.split(' as ')[0] not in existing_bases:
                existing_imports.append(icon)
                existing_bases.append(icon)
        
        existing_imports = [i for i in existing_imports if i]
        new_lucide = f"import {{ {', '.join(existing_imports)} }} from 'lucide-react'"
        content = content[:lucide_match.start()] + new_lucide + content[lucide_match.end():]
    else:
        content = f"import {{ {', '.join(required_icons)} }} from 'lucide-react';\n" + content

    # Add LogoutButton import if missing
    if 'LogoutButton' not in content and '../../components/LogoutButton' not in content:
        content = content.replace("import { Link", "import { LogoutButton } from '../../components/LogoutButton';\nimport { Link")
        if 'LogoutButton' not in content:
             content = "import { LogoutButton } from '../../components/LogoutButton';\n" + content
             
    # Ensure Link is imported
    if 'Link' not in content and 'react-router-dom' in content:
         rr_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'react-router-dom'", content)
         if rr_match and 'Link' not in rr_match.group(1):
             content = content.replace(rr_match.group(0), f"import {{ {rr_match.group(1)}, Link }} from 'react-router-dom'")
    elif 'Link' not in content:
         content = "import { Link } from 'react-router-dom';\n" + content

    with open(filepath, 'w') as f:
        f.write(content)

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    update_file(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    update_file(filepath)
