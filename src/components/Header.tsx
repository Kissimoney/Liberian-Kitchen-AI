import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, BookOpen, User as UserIcon, LogOut, Users, Clock, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './Auth/AuthModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform">
              <UtensilsCrossed size={24} />
            </div>
            <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">Liberian<span className="text-amber-600">Kitchen</span></span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`font - medium text - sm transition - colors ${isActive('/') ? 'text-amber-600' : 'text-stone-600 hover:text-stone-900'} `}
            >
              Create
            </Link>
            <Link
              to="/community"
              className={`flex items - center gap - 2 font - medium text - sm transition - colors ${isActive('/community') ? 'text-amber-600' : 'text-stone-600 hover:text-stone-900'} `}
            >
              <Users size={18} />
              <span className="hidden sm:inline">Community</span>
            </Link>
            <Link
              to="/saved"
              className={`flex items - center gap - 2 font - medium text - sm transition - colors ${isActive('/saved') ? 'text-amber-600' : 'text-stone-600 hover:text-stone-900'} `}
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">My Cookbook</span>
            </Link>
            {user && (
              <Link
                to="/history"
                className={`flex items - center gap - 2 font - medium text - sm transition - colors ${isActive('/history') ? 'text-amber-600' : 'text-stone-600 hover:text-stone-900'} `}
              >
                <Clock size={18} />
                <span className="hidden sm:inline">History</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 border-l border-stone-200 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs uppercase">
                    {user.email?.substring(0, 2)}
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-stone-900">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/notifications"
                  className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                </Link>
                <Link
                  to="/profile"
                  className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                  title="Profile"
                >
                  <UserIcon size={20} />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-stone-800 transition-colors shadow-md"
              >
                <UserIcon size={16} />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};