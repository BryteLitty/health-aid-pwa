import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import App from "./App"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import AddMedicationPage from "./pages/AddMedicationPage"
import AddAppointmentPage from "./pages/AddAppointmentPage"
import MedicationsPage from "./pages/MedicationsPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import { AuthProvider } from "./context/AuthContext"
import OnboardingPage from "./pages/OnboardingPage"
import ProtectedRoute from "./components/ProtectedRoute"
import { Toaster } from 'sonner';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage'
import MedicationDetailsPage from './pages/MedicationDetailsPage'
import SchedulePage from './pages/SchedulePage'
import HealthPage from './pages/HealthPage'
import AccountPage from "./pages/AccountPage"

// Create a NotFoundPage component
const NotFoundPage = () => (
  <div className="container max-w-xl mx-auto px-4 pb-20 min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-3xl font-bold mb-4">404</h1>
    <p className="text-xl mb-6">Page not found</p>
    <a href="/" className="text-blue-500 hover:underline">Go back home</a>
  </div>
);

// PublicRoute component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signup",
    element: <PublicRoute><SignUpPage /></PublicRoute>,
  },
  {
    path: "/login",
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: "/onboarding",
    element: <ProtectedRoute><OnboardingPage /></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: "/add-medication",
    element: <ProtectedRoute><AddMedicationPage /></ProtectedRoute>,
  },
  {
    path: "/edit-medication/:id",
    element: <ProtectedRoute><AddMedicationPage /></ProtectedRoute>,
  },
  {
    path: "/add-appointment",
    element: <ProtectedRoute><AddAppointmentPage /></ProtectedRoute>,
  },
  {
    path: "/edit-appointment/:id",
    element: <ProtectedRoute><AddAppointmentPage /></ProtectedRoute>,
  },
  {
    path: "/medications",
    element: <ProtectedRoute><MedicationsPage /></ProtectedRoute>,
  },
  {
    path: "/appointments",
    element: <ProtectedRoute><AppointmentsPage /></ProtectedRoute>,
  },
  {
    path: "/schedule",
    element: <ProtectedRoute><SchedulePage /></ProtectedRoute>,
  },
  {
    path: "/health",
    element: <ProtectedRoute><HealthPage /></ProtectedRoute>,
  },
  {
    path: "/account",
    element: <ProtectedRoute><AccountPage /></ProtectedRoute>,
  },
  {
    path: "/appointment-details/:id",
    element: <ProtectedRoute><AppointmentDetailsPage /></ProtectedRoute>,
  },
  {
    path: "/medication-details/:id",
    element: <ProtectedRoute><MedicationDetailsPage /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AuthProvider>
  </React.StrictMode>
)
