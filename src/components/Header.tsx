import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, BookOpen, User as UserIcon, LogOut, Users, Clock, Bell, Folder, Menu, X, ChefHat, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './Auth/AuthModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/', icon: ChefHat, label: 'Create', exact: true },
    { to: '/community', icon: Users, label: 'Community' },
    { to: '/saved', icon: BookOpen, label: 'My Cookbook' },
  ];

  const userLinks = [
    { to: '/collections', icon: Folder, label: 'Collections' },
    { to: '/history', icon: Clock, label: 'History' },
  ];

  return (
    <>
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-stone-200/50 shadow-lg shadow-stone-200/20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Section - Clean & Separated */}
            <Link to="/" className="flex items-center gap-3 group relative mr-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="relative w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <UtensilsCrossed className="text-white" size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-serif font-bold bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 bg-clip-text text-transparent leading-tight flex items-center">
                  <span>Liberian</span>
                  <span className="text-amber-600 ml-1.5 leading-none">Kitchen</span>
                </span>
                <span className="text-[10px] text-stone-500 tracking-wider uppercase font-semibold -mt-1 flex items-center gap-1">
                  <Sparkles size={8} className="text-amber-500" />
                  AI-Powered
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on Mobile via CSS ID */}
            <div id="desktop-nav" className="hidden lg:flex items-center gap-4">
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = link.exact ? location.pathname === link.to : isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${active ? 'text-amber-600 bg-amber-50' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                      <span className="font-bold">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="h-6 w-px bg-stone-200 mx-2"></div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Link to="/notifications" className="p-2 text-stone-400 hover:text-amber-600 transition-all">
                      <Bell size={20} />
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 p-1 rounded-full hover:bg-stone-50 transition-all">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                        {user.email?.substring(0, 2).toUpperCase()}
                      </div>
                    </Link>
                    <button onClick={signOut} className="p-2 text-stone-400 hover:text-red-500 transition-all">
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-amber-600 transition-all shadow-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Hamburger Button Container - Shown only on Mobile via CSS ID */}
            <div id="mobile-nav-toggle" className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all active:scale-95 flex items-center justify-center bg-stone-100/50"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={26} strokeWidth={2.5} className="text-amber-600" />
                ) : (
                  <Menu size={26} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = link.exact
                    ? location.pathname === link.to
                    : isActive(link.to);

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${active
                        ? 'text-amber-600 bg-amber-50/80 shadow-sm border border-amber-100/50'
                        : 'text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      <div className={`p-2 rounded-xl ${active ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-500'}`}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                      <span>{link.label}</span>
                      {active && <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                    </Link>
                  );
                })}
              </div>

              {/* Authenticated User Links */}
              {user && (
                <>
                  <div className="border-t border-stone-200 my-3"></div>
                  <div className="space-y-1">
                    {userLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.to);

                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${active
                            ? 'text-amber-600 bg-amber-50/80 shadow-sm border border-amber-100/50'
                            : 'text-stone-700 hover:bg-stone-50'
                            }`}
                        >
                          <div className={`p-2 rounded-xl ${active ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-500'}`}>
                            <Icon size={22} strokeWidth={2.5} />
                          </div>
                          <span>{link.label}</span>
                          {active && <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-stone-200 my-3"></div>

                  {/* User Actions */}
                  <div className="space-y-1">
                    <Link
                      to="/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-lg text-stone-700 hover:bg-stone-50 transition-all active:scale-[0.98]"
                    >
                      <div className="p-2 rounded-xl bg-stone-100 text-stone-500">
                        <Bell size={22} strokeWidth={2.5} />
                      </div>
                      <span>Notifications</span>
                      <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-lg text-stone-700 hover:bg-stone-50 transition-all active:scale-[0.98]"
                    >
                      <div className="p-2 rounded-xl bg-stone-100 text-stone-500">
                        <UserIcon size={22} strokeWidth={2.5} />
                      </div>
                      <span>Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-stone-100 my-4"></div>

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-lg text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
                  >
                    <div className="p-2 rounded-xl bg-red-50 text-red-500">
                      <LogOut size={22} strokeWidth={2.5} />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </>
              )}

              {/* Guest Sign In */}
              {!user && (
                <>
                  <div className="border-t border-stone-200 my-3"></div>
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-stone-900 to-stone-800 text-white px-4 py-4 rounded-xl font-bold text-base hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg active:scale-95"
                  >
                    <UserIcon size={22} strokeWidth={2.5} />
                    <span>Sign In</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};