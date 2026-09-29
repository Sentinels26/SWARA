import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Restoring session..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    // If they have the wrong role, send them to their correct dashboard
    if (user.role === 'PROFESSIONAL') {
      return <Navigate to="/professional/dashboard" replace />;
    } else {
      if (!user.onboarding_completed) {
        return <Navigate to="/survivor/onboarding" replace />;
      }
      return <Navigate to="/survivor/dashboard" replace />;
    }
  }

  // If role matches SURVIVOR, check onboarding
  if (user.role === 'SURVIVOR') {
    // Determine current path
    const isPathOnboarding = window.location.pathname.startsWith('/survivor/onboarding');
    
    if (!user.onboarding_completed && !isPathOnboarding) {
      return <Navigate to="/survivor/onboarding" replace />;
    }
    
    if (user.onboarding_completed && isPathOnboarding) {
      return <Navigate to="/survivor/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
