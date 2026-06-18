/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import CardDesigner from './pages/CardDesigner';
import PublicProfile from './pages/PublicProfile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/editor" 
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/designer" 
            element={
              <PrivateRoute>
                <CardDesigner />
              </PrivateRoute>
            } 
          />
          <Route path="/:username" element={<PublicProfile />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
