import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/auth/LoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import PatientDashboard from '@/pages/patient/PatientDashboard';

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">SIPURO RSSA</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.fullName}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{user.role}</span>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {user.role === 'ADMIN' && <AdminDashboard />}
        {user.role === 'DOCTOR' && <DoctorDashboard />}
        {user.role === 'PATIENT' && <PatientDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardRouter />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;