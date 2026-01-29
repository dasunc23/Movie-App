import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AIRecommend from './pages/AIRecommend';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetail';
import Watchlist from './pages/Watchlist';
import WatchParty from './pages/WatchParty';
import WatchPartyDetails from './pages/WatchPartyDetails';
import AdminDashboard from './pages/AdminDashboard';
import Browse from './pages/Browse';
import { Footer } from './components/layout/Footer';
import { Loader } from './components/common';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />

            <Route path="/ai-recommend" element={
              <ProtectedRoute>
                <AIRecommend />
              </ProtectedRoute>
            } />

            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />

            <Route path="/movie/:id" element={
              <ProtectedRoute>
                <MovieDetails />
              </ProtectedRoute>
            } />

            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />

            <Route path="/watch-parties" element={
              <ProtectedRoute>
                <WatchParty />
              </ProtectedRoute>
            } />

            <Route path="/watch-party/:id" element={
              <ProtectedRoute>
                <WatchPartyDetails />
              </ProtectedRoute>
            } />

            <Route path="/browse/:type" element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
                      {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;