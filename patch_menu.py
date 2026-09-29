import re
import os

new_aside = """      <aside className={`bg-slate-900 text-slate-300 flex-col sticky top-0 h-screen overflow-y-auto hidden md:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} shrink-0 z-50`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 relative">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-md bg-white p-1" />
            <div className="font-bold text-2xl text-white tracking-tight">SWARA</div>
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute right-4 top-8 text-slate-400 hover:text-white transition-colors">
            {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-x-hidden">
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Main</div>}
          <Link to="/professional/dashboard" title="Home" className="flex items-center gap-3 px-3 py-2 bg-accent-blue/10 text-accent-blue rounded-lg font-medium whitespace-nowrap"><HomeIcon className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Home'}</Link>
          <Link to="/professional/cases" title="Cases" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Users className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Cases'}</Link>
          <Link to="/professional/alerts" title="Safety Queue" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><ShieldAlert className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Safety Queue'}</Link>
          <Link to="/professional/appointments" title="Appointments" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Calendar className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Appointments'}</Link>
          <Link to="/professional/reports" title="Reports" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><FileText className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Reports'}</Link>
          
          {!isSidebarCollapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Tools</div>}
          <Link to="/professional/referral" title="Add Case" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><BookOpen className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Add Case'}</Link>
          <Link to="/professional/audit" title="Activity & Audit" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Activity className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Activity & Audit'}</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800 overflow-x-hidden">
          <Link to="/professional/settings" title="Settings" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><Settings className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Settings'}</Link>
          <Link to="/professional/profile" title="Profile" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap"><User className="w-5 h-5 shrink-0"/> {!isSidebarCollapsed && 'Profile'}</Link>
          <div className="mt-2 w-full">
            <LogoutButton showText={!isSidebarCollapsed} className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-colors w-full whitespace-nowrap" />
          </div>
        </div>
      </aside>"""

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace the <aside> block
    start_aside = content.find('<aside')
    end_aside = content.find('</aside>') + 8
    
    if start_aside != -1 and end_aside != -1:
        content = content[:start_aside] + new_aside + content[end_aside:]
        
    # Add isSidebarCollapsed state
    if 'const [isSidebarCollapsed' not in content:
        content = content.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);')
        
    # Add Menu, X, ShieldAlert to lucide-react imports if not there
    lucide_match = re.search(r"import \{([^}]+)\} from 'lucide-react'", content)
    if lucide_match:
        imports = [i.strip() for i in lucide_match.group(1).split(',')]
        if 'Menu' not in imports: imports.append('Menu')
        if 'X' not in imports: imports.append('X')
        if 'ShieldAlert' not in imports: imports.append('ShieldAlert')
        if 'User' not in imports: imports.append('User')
        
        new_lucide = f"import {{ {', '.join(imports)} }} from 'lucide-react'"
        content = content[:lucide_match.start()] + new_lucide + content[lucide_match.end():]
        
    # Check if LogoutButton is imported
    if 'LogoutButton' not in content:
        content = content.replace("import api from '../../api';", "import api from '../../api';\nimport { LogoutButton } from '../../components/LogoutButton';")

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Home.tsx')
patch_file('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Cases.tsx')
