import os
import re

sidebar_code = """import { useState } from 'react';
import { Home, ClipboardCheck, MessageCircle, HeartPulse, User, Activity, AlertTriangle, X, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogoutButton } from './LogoutButton';

export function SurvivorSidebar({ onOpenSos, hasCheckedInToday = false }: { onOpenSos: () => void, hasCheckedInToday?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white text-slate-600 hover:text-[#2c757c] md:flex hidden hover:scale-105 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>
    );
  }

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-col hidden md:flex sticky top-0 h-screen relative overflow-hidden shrink-0 shadow-lg">
      
      {/* User image as background as requested by user (opacity lowered for readability) */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url(/user.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }}></div>
      
      {/* Close Button */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 z-20 p-2 bg-white/60 hover:bg-white border border-white/80 rounded-full text-slate-600 backdrop-blur-md transition-all shadow-sm hover:scale-105 hover:text-red-500"
        title="Close Menu"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 p-8 relative z-10">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md shadow-sm" />
        <div className="font-bold text-xl text-slate-800 tracking-wider drop-shadow-sm">SWARA</div>
      </div>

      <nav className="flex-1 py-4 px-6 flex flex-col gap-1 overflow-y-auto relative z-10">
        <Link to="/survivor/dashboard" className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/dashboard') ? 'active' : ''}`}>
          <Home className="w-5 h-5"/>{t('nav.home')}
        </Link>
        <Link to={hasCheckedInToday ? "#" : "/survivor/check-in"} className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/check-in') ? 'active' : ''} ${hasCheckedInToday ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <ClipboardCheck className="w-5 h-5"/>{t('nav.check_in')}
        </Link>
        <Link to="/survivor/journey" className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/journey') ? 'active' : ''}`}>
          <Activity className="w-5 h-5"/>{t('nav.journey')}
        </Link>
        <Link to="/survivor/support" className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/support') ? 'active' : ''}`}>
          <HeartPulse className="w-5 h-5"/>{t('nav.support')}
        </Link>
        <Link to="/survivor/chat" className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/chat') ? 'active' : ''}`}>
          <MessageCircle className="w-5 h-5"/>{t('nav.messages')}
        </Link>
        <Link to="/survivor/profile" className={`swara-nav-item flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors font-medium ${isActive('/profile') ? 'active' : ''}`}>
          <User className="w-5 h-5"/>{t('nav.profile')}
        </Link>
      </nav>
      
      <div className="p-6 relative z-10">
        <button onClick={onOpenSos} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-xl transition-colors border border-red-100 w-full mb-3 shadow-sm hover:shadow-md">
          <AlertTriangle className="w-4 h-4" /> SOS
        </button>
        <LogoutButton className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white/80 backdrop-blur-sm border border-transparent hover:border-white/50 font-medium rounded-xl transition-all w-full text-left" />
      </div>
    </aside>
  );
}
"""

components_dir = "/Users/macbookair/Documents/swara1/frontend/src/components"
sidebar_file = os.path.join(components_dir, "SurvivorSidebar.tsx")
with open(sidebar_file, "w") as f:
    f.write(sidebar_code)

pages_dir = "/Users/macbookair/Documents/swara1/frontend/src/pages/survivor"
pages = ["Dashboard.tsx", "CheckIn.tsx", "Chat.tsx", "Journey.tsx", "Support.tsx", "Profile.tsx"]

for page in pages:
    page_path = os.path.join(pages_dir, page)
    if not os.path.exists(page_path): continue
    
    with open(page_path, "r") as f:
        content = f.read()

    # Add import if missing
    if "import { SurvivorSidebar }" not in content:
        content = re.sub(r"(import .*? from 'react-router-dom';)", r"\1\nimport { SurvivorSidebar } from '../../components/SurvivorSidebar';", content)
    
    # Replace <aside> ... </aside> with <SurvivorSidebar onOpenSos={() => setIsSosOpen(true)} />
    content = re.sub(
        r'<aside className="w-64[^>]*>.*?</aside>', 
        r'<SurvivorSidebar onOpenSos={() => setIsSosOpen(true)} hasCheckedInToday={typeof hasCheckedInToday !== "undefined" ? hasCheckedInToday : false} />', 
        content, 
        flags=re.DOTALL
    )
    
    with open(page_path, "w") as f:
        f.write(content)

print("SurvivorSidebar applied to all pages.")
