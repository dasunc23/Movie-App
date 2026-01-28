import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark-card/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-4xl">🎬</span>
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              CineMatch
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-gray-300 hover:text-white transition-colors">
                Search
              </Link>
              <Link to="/ai-recommend" className="text-gray-300 hover:text-white transition-colors">
                AI Recommend
              </Link>
              <Link to="/watchlist" className="text-gray-300 hover:text-white transition-colors">
                Watchlist
              </Link>
              <Link to="/watch-parties" className="text-gray-300 hover:text-white transition-colors">
                Watch Parties
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-red-400 hover:text-red-300 transition-colors">
                Admin
              </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <img 
                      src={user?.avatar || 'https://via.placeholder.com/150'} 
                      alt={user?.name}
                      className="w-8 h-8 rounded-full border-2 border-primary-500"
                    />
                    <span className="text-sm font-medium hidden md:block">{user?.name}</span>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};