import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Welcome from './pages/welcome/Welcome.tsx';
import ProfessionalAuth from './pages/auth/ProfessionalAuth.tsx';
import SurvivorAuth from './pages/auth/SurvivorAuth.tsx';

import SurvivorDashboard from './pages/survivor/Dashboard.tsx';
import SurvivorCheckIn from './pages/survivor/CheckIn.tsx';
import OnboardingFlow from './pages/survivor/onboarding/OnboardingFlow.tsx';
import Chat from './pages/survivor/Chat.tsx';
import Journey from './pages/survivor/Journey.tsx';
import Support from './pages/survivor/Support.tsx';
import Profile from './pages/survivor/Profile.tsx';

import ProfessionalHome from './pages/professional/Home.tsx';
import ProfessionalCases from './pages/professional/Cases.tsx';
import ProfessionalAlerts from './pages/professional/Alerts.tsx';
import ProfessionalAppointments from './pages/professional/Appointments.tsx';
import CaseWorkspace from './pages/professional/CaseWorkspace.tsx';
import ProfessionalReferral from './pages/professional/Referral.tsx';
import ProfessionalReports from './pages/professional/Reports.tsx';
import ProfessionalAudit from './pages/professional/AuditActivity.tsx';
import ProfessionalSettings from './pages/professional/Settings.tsx';
import ProfessionalProfile from './pages/professional/Profile.tsx';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate cursor position as a percentage of the window for CSS radial gradients
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/auth/professional" element={<ProfessionalAuth />} />
        <Route path="/auth/survivor" element={<SurvivorAuth />} />

        {/* Survivor Routes */}
        <Route path="/survivor/onboarding" element={
          <ProtectedRoute allowedRole="SURVIVOR"><OnboardingFlow /></ProtectedRoute>
        } />
        <Route path="/survivor/dashboard" element={
          <ProtectedRoute allowedRole="SURVIVOR"><SurvivorDashboard /></ProtectedRoute>
        } />
        <Route path="/survivor/check-in" element={
          <ProtectedRoute allowedRole="SURVIVOR"><SurvivorCheckIn /></ProtectedRoute>
        } />
        <Route path="/survivor/journey" element={
          <ProtectedRoute allowedRole="SURVIVOR"><Journey /></ProtectedRoute>
        } />
        <Route path="/survivor/support" element={
          <ProtectedRoute allowedRole="SURVIVOR"><Support /></ProtectedRoute>
        } />
        <Route path="/survivor/profile" element={
          <ProtectedRoute allowedRole="SURVIVOR"><Profile /></ProtectedRoute>
        } />
        <Route path="/survivor/chat" element={
          <ProtectedRoute allowedRole="SURVIVOR"><Chat /></ProtectedRoute>
        } />

        {/* Professional Routes */}
        <Route path="/professional/dashboard" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalHome /></ProtectedRoute>
        } />
        <Route path="/professional/cases" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalCases /></ProtectedRoute>
        } />
        <Route path="/professional/alerts" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalAlerts /></ProtectedRoute>
        } />
        <Route path="/professional/appointments" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalAppointments /></ProtectedRoute>
        } />
        <Route path="/professional/case/:id" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><CaseWorkspace /></ProtectedRoute>
        } />
        <Route path="/professional/referral" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalReferral /></ProtectedRoute>
        } />
        <Route path="/professional/reports" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalReports /></ProtectedRoute>
        } />
        <Route path="/professional/audit" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalAudit /></ProtectedRoute>
        } />
        <Route path="/professional/settings" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalSettings /></ProtectedRoute>
        } />
        <Route path="/professional/profile" element={
          <ProtectedRoute allowedRole="PROFESSIONAL"><ProfessionalProfile /></ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
