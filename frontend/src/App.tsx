import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/ProtectedRoute'
import SplashScreen from './components/SplashScreen'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load route components for performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const ReportIssuePage = lazy(() => import('./pages/dashboard/ReportIssuePage'))
const InteractiveMap = lazy(() => import('./pages/dashboard/InteractiveMap'))
const IssueDetails = lazy(() => import('./pages/dashboard/IssueDetails'))
const Leaderboard = lazy(() => import('./pages/dashboard/Leaderboard'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const OfficerDashboard = lazy(() => import('./pages/dashboard/OfficerDashboard'))
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

function App() {
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(true)

  // Get root path to prevent unmounting DashboardLayout on sub-routes
  const rootPath = location.pathname.split('/')[1] || '/'

  // Only show splash on initial load
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (hasSeenSplash) {
      setShowSplash(false)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('hasSeenSplash', 'true')
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={rootPath}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="report" element={<ReportIssuePage />} />
              <Route path="map" element={<InteractiveMap />} />
              <Route path="issues/:id" element={<IssueDetails />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={['Admin', 'Super Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="officer"
                element={
                  <ProtectedRoute roles={['Officer', 'Department Manager', 'Admin', 'Super Admin']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
