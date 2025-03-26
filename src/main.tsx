import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AddMedicationPage from './pages/AddMedicationPage'
import AddAppointmentPage from './pages/AddAppointmentPage'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Homescreen from './pages/Homescreen'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homescreen />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-medication"
            element={
              <ProtectedRoute>
                <AddMedicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-appointment"
            element={
              <ProtectedRoute>
                <AddAppointmentPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
