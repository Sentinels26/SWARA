import { useState, useEffect } from 'react';
import { Activity, Eye, Type, MousePointer2 } from 'lucide-react';

export function AccessibilitySettings() {
  const [textSize, setTextSize] = useState(() => localStorage.getItem('textSize') || 'default');
  const [contrast, setContrast] = useState(() => localStorage.getItem('contrast') || 'default');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reducedMotion') === 'true');

  useEffect(() => {
    // Apply Text Size globally
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-default', 'text-size-large', 'text-size-xl');
    root.classList.add(`text-size-${textSize}`);
    localStorage.setItem('textSize', textSize);
    
    // Apply Contrast globally
    root.classList.remove('high-contrast');
    if (contrast === 'high') {
      root.classList.add('high-contrast');
    }
    localStorage.setItem('contrast', contrast);
    
    // Apply Reduced Motion globally
    root.classList.remove('reduced-motion');
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    }
    localStorage.setItem('reducedMotion', String(reducedMotion));
  }, [textSize, contrast, reducedMotion]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-50">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#f0f9fa] flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#2c757c]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Accessibility</h2>
          <p className="text-sm text-slate-500">Customize how SWARA looks and responds to you.</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Text Size */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-800 text-sm">Text Size</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['small', 'default', 'large', 'xl'].map(size => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  textSize === size ? 'border-[#2c757c] bg-[#f0f9fa] text-[#2c757c]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                aria-pressed={textSize === size}
                aria-label={`Set text size to ${size}`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-800 text-sm">Contrast</h3>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setContrast('default')}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                contrast === 'default' ? 'border-[#2c757c] bg-[#f0f9fa] text-[#2c757c]' : 'border-slate-200 text-slate-600'
              }`}
              aria-pressed={contrast === 'default'}
            >
              Default
            </button>
            <button
              onClick={() => setContrast('high')}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                contrast === 'high' ? 'border-[#2c757c] bg-[#f0f9fa] text-[#2c757c]' : 'border-slate-200 text-slate-600'
              }`}
              aria-pressed={contrast === 'high'}
            >
              High Contrast
            </button>
          </div>
        </div>

        {/* Reduced Motion */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-slate-400" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Reduced Motion</h3>
                <p className="text-xs text-slate-500">Minimize animations and transitions.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                aria-label="Toggle reduced motion"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2c757c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c757c]"></div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
