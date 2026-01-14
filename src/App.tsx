import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SchedulingPage } from './pages/Candidate/SchedulingPage';
import { ManageAppointmentPage } from './pages/Candidate/ManageAppointmentPage';
import { UserAppointmentsPage } from './pages/Candidate/UserAppointmentsPage';
import { LoginPage } from './pages/Coordinator/LoginPage';
import { AppointmentsPage } from './pages/Coordinator/AppointmentsPage';
import { ScheduleManagementPage } from './pages/Coordinator/ScheduleManagementPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Candidate Routes */}
          <Route path="/candidato/agendamento" element={<SchedulingPage />} />
          <Route path="/candidato/agendamentos" element={<UserAppointmentsPage />} />
          <Route path="/candidato/gerenciar" element={<ManageAppointmentPage />} />
          
          {/* Coordinator Routes */}
          <Route path="/coordinator/login" element={<LoginPage />} />
          <Route 
            path="/coordinator" 
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coordinator/schedule" 
            element={
              <ProtectedRoute>
                <ScheduleManagementPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/coordinator/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;