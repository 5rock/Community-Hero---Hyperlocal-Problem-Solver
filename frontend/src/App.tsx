import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load route components for performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const ReportIssuePage = lazy(() => import('./pages/dashboard/ReportIssuePage'))
const InteractiveMap = lazy(() => import('./pages/dashboard/InteractiveMap'))
const IssueDetails = lazy(() => import('./pages/dashboard/IssueDetails'))
const Leaderboard = lazy(() => import('./pages/dashboard/Leaderboard'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const OfficerDashboard = lazy(() => import('./pages/dashboard/OfficerDashboard'))

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="officer" element={<OfficerDashboard />} />
          <Route path="report" element={<ReportIssuePage />} />
          <Route path="map" element={<InteractiveMap />} />
          <Route path="issues/:id" element={<IssueDetails />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
