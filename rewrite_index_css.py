import os

css_file = "/Users/macbookair/Documents/swara1/frontend/src/index.css"

new_css = """@import "tailwindcss";

@theme {
  --color-primary: #1e3a8a; /* Dark navy */
  --color-accent-blue: #3b82f6; /* Blue */
  --color-accent-teal: #14b8a6; /* Muted teal */
  --color-accent-lavender: #a78bfa; /* Subtle lavender */
}

@custom-variant dark (&:where(.dark, .dark *));

/* ==========================================================================
   1. SWARA DESIGN TOKENS
   ========================================================================== */
:root {
  /* Colors */
  --swara-teal: #2c757c;
  --swara-aqua: #235e63;
  --swara-blue: #3b82f6;
  --swara-lavender: #a78bfa;
  --swara-navy: #1f2937;
  --swara-coral: #f43f5e;
  
  /* Glassmorphism */
  --swara-glass-strong: rgba(255, 255, 255, 0.90);
  --swara-glass-medium: rgba(255, 255, 255, 0.72);
  --swara-glass-light: rgba(255, 255, 255, 0.40);
  --swara-glass-transparent: rgba(255, 255, 255, 0.20);
  
  /* Borders & Highlights */
  --swara-border: rgba(255, 255, 255, 0.65);
  --swara-border-strong: rgba(255, 255, 255, 0.9);
  --swara-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 1px 0 0 rgba(255, 255, 255, 0.3);
  
  /* Shadows */
  --swara-shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.04);
  --swara-shadow-hover: 0 14px 35px rgba(30, 80, 100, 0.10);
  --swara-shadow-teal: 0 8px 22px rgba(45, 130, 135, 0.20);
  --swara-shadow-blue: 0 8px 22px rgba(59, 130, 246, 0.20);
  
  /* Blur */
  --swara-blur-sm: blur(8px);
  --swara-blur-md: blur(18px);
  --swara-blur-lg: blur(28px);
  
  /* Motion & Easing */
  --ease-swara: cubic-bezier(0.22, 1, 0.36, 1);
  --transition-fast: 150ms var(--ease-swara);
  --transition-normal: 250ms var(--ease-swara);
  --transition-slow: 400ms var(--ease-swara);
  
  /* Mouse Tracking for Glow */
  --mouse-x: 50%;
  --mouse-y: 50%;
}

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans antialiased;
    transition: background-color var(--transition-normal);
  }
}

/* ==========================================================================
   2. GLOBAL PAGE LOAD ANIMATION
   ========================================================================== */
@keyframes pageFadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-page-load {
  animation: pageFadeInUp 600ms var(--ease-swara) forwards;
}
.animate-page-load-stagger-1 {
  animation: pageFadeInUp 600ms var(--ease-swara) 100ms forwards;
  opacity: 0;
}
.animate-page-load-stagger-2 {
  animation: pageFadeInUp 600ms var(--ease-swara) 200ms forwards;
  opacity: 0;
}
.animate-page-load-stagger-3 {
  animation: pageFadeInUp 600ms var(--ease-swara) 300ms forwards;
  opacity: 0;
}

/* ==========================================================================
   3. PREMIUM CARD SYSTEM
   ========================================================================== */
.swara-card {
  background: var(--swara-glass-medium);
  backdrop-filter: var(--swara-blur-md);
  border: 1px solid var(--swara-border);
  box-shadow: var(--swara-shadow-soft);
  border-radius: 1.5rem;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.swara-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--swara-highlight);
  pointer-events: none;
}

/* Cursor Glow Effect on Hover */
.swara-card-interactive {
  cursor: pointer;
}
.swara-card-interactive::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--transition-normal);
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.4),
    transparent 40%
  );
  pointer-events: none;
  z-index: 0;
}

.swara-card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--swara-shadow-hover);
  border-color: var(--swara-border-strong);
}

.swara-card-interactive:hover::after {
  opacity: 1;
}

/* ==========================================================================
   4. BUTTON SYSTEM
   ========================================================================== */
/* Primary Teal Button */
.swara-btn-primary {
  background: linear-gradient(135deg, var(--swara-teal), var(--swara-aqua));
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: var(--swara-shadow-teal);
  color: white;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.swara-btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg);
  transition: none;
}

.swara-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(45, 130, 135, 0.30);
  filter: brightness(1.05);
}

.swara-btn-primary:hover::after {
  animation: buttonLightSweep 1s var(--ease-swara);
}

.swara-btn-primary:active {
  transform: translateY(1px) scale(0.985);
  box-shadow: 0 4px 10px rgba(45, 130, 135, 0.20);
}

@keyframes buttonLightSweep {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* Secondary Glass Button */
.swara-btn-glass {
  background: var(--swara-glass-medium);
  backdrop-filter: var(--swara-blur-sm);
  border: 1px solid var(--swara-border-strong);
  color: var(--swara-teal);
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: var(--swara-shadow-soft);
}

.swara-btn-glass:hover {
  background: var(--swara-glass-strong);
  transform: translateY(-2px);
  box-shadow: var(--swara-shadow-hover);
}

.swara-btn-glass:active {
  transform: translateY(1px) scale(0.98);
}

/* Arrow Interaction */
.swara-btn-primary svg.lucide-arrow-right,
.swara-btn-glass svg.lucide-arrow-right {
  transition: transform var(--transition-fast);
}
.swara-btn-primary:hover svg.lucide-arrow-right,
.swara-btn-glass:hover svg.lucide-arrow-right {
  transform: translateX(3px);
}

/* ==========================================================================
   5. SIDEBAR NAVIGATION
   ========================================================================== */
.swara-nav-item {
  transition: all var(--transition-normal);
  color: #4b5563; /* slate-600 */
}
.swara-nav-item:hover {
  background-color: rgba(255, 255, 255, 0.4);
  transform: translateX(2px);
  color: var(--swara-navy);
  box-shadow: 2px 4px 12px rgba(0,0,0,0.02);
}
.swara-nav-item:hover svg {
  color: var(--swara-teal);
}

.swara-nav-item.active {
  background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(220,247,246,0.70));
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(50, 120, 140, 0.08);
  color: var(--swara-teal);
  font-weight: 700;
}
.swara-nav-item.active svg {
  color: var(--swara-teal);
  filter: drop-shadow(0 0 4px rgba(44, 117, 124, 0.3));
}

/* ==========================================================================
   6. AMBIENT BACKGROUND MOTION
   ========================================================================== */
.swara-bg-ambient {
  background-image: url('/bgall.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}
.swara-bg-ambient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  animation: ambientBreathe 12s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 0;
}

@keyframes ambientBreathe {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.6; }
}

/* ==========================================================================
   7. ACCESSIBILITY OVERRIDES
   ========================================================================== */
.text-size-small { font-size: 0.875rem !important; }
.text-size-large { font-size: 1.125rem !important; }
.text-size-xl { font-size: 1.25rem !important; }

.high-contrast {
  --color-primary: #000 !important;
  --color-accent-teal: #005f5f !important;
  --tw-bg-opacity: 1 !important;
  background-color: white !important;
  color: black !important;
  border-color: black !important;
}
.high-contrast * {
  border-color: #333 !important;
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
"""

with open(css_file, "w") as f:
    f.write(new_css)

print("index.css updated with SWARA motion system and design tokens.")
