import React from 'react';
import { Sun, Moon, Menu, X, Wallet, User, RefreshCw, Clock, LogIn } from 'lucide-react';
import type { WalletConnection } from '../../types/index';
import type { PageType, ThemeType } from '../../types/index';
import type { Token } from '../../types/index';
import { useSharedSession } from '../../hooks/sessionTimer';

import LightLogo from './light.png';
import DarkLogo from './dark.png';

interface NavigationProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  wallet: WalletConnection | null;
  setShowWalletModal: (show: boolean) => void;
  marketLoading: boolean;
  marketError: string | null;
  refetch: () => void;
  showWalletModal: boolean;
  selectedTokenForAnalysis: Token | null;
  setSelectedTokenForAnalysis: React.Dispatch<React.SetStateAction<Token | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onLearnAdminLogin?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  theme,
  setTheme,
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  wallet,
  setShowWalletModal,
  marketLoading,
  marketError,
  refetch,
  showWalletModal,
  selectedTokenForAnalysis,
  setSelectedTokenForAnalysis,
  searchQuery,
  setSearchQuery,
  onLearnAdminLogin
}) => {
  const isDark = theme === 'dark';
  const { isUnlocked, remainingTime, isWarning, extendSession, lock } = useSharedSession();

  const navigationItems = [
    { name: 'Home', id: 'home' as PageType },
    { name: 'Manager', id: 'manager' as PageType },
    { name: 'Watch', id: 'watch' as PageType },
    { name: 'Learn', id: 'learn' as PageType }
  ];

  // Format remaining time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Session Timer Component for Navigation
  const SessionTimer = () => {
    return (
      <div className="relative group">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
            isWarning 
              ? isDark 
                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-600'
              : isDark 
                ? 'bg-white/10 border-white/20 text-blue-400' 
                : 'bg-gray-100 border-gray-200 text-blue-600'
          }`}
          // onClick={extendSession}
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono font-medium">
            {formatTime(remainingTime)}
          </span>
        </div>

        {/* Extended options on hover */}
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border rounded-lg shadow-lg p-2 flex gap-2 whitespace-nowrap`}>
          <button
            className={`text-xs px-3 py-1 rounded transition-colors ${
              isDark 
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            Session Timer
          </button>
        </div>
      </div>
    );
  };

  return (
    <nav className={`fixed w-full z-50 backdrop-blur-xl border-b ${
      isDark 
        ? 'bg-slate-900/80 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center mb-3">
            <div className="">
                <img
                    src={isDark ? DarkLogo : LightLogo}
                    alt="Logo"
                    className={`h-full object-contain transition-all duration-500 ${
                      isDark ? 'w-[180px] mt-3' : 'w-[150px] mt-3' 
                    }`}
                  />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white shadow-lg shadow-blue-500/25'
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                      : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Always show Login on Learn page, otherwise show Session Timer or Refresh */}
            {currentPage === 'learn' ? (
              <button
                onClick={onLearnAdminLogin}
                className={`hidden md:flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-blue-400 hover:bg-white/20' 
                    : 'bg-gray-100 border-gray-200 text-blue-600 hover:bg-gray-200'
                }`}
                title="Login"
              >
                <LogIn className="w-5 h-5" />
              </button>
            ) : (
              /* Session Timer replaces Refresh when session is active (not on learn page) */
              isUnlocked ? (
                <SessionTimer />
              ) : (
                <button
                  onClick={refetch}
                  disabled={marketLoading}
                  className={`hidden md:block p-3 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                    isDark 
                      ? 'text-blue-400' 
                      : 'text-blue-600'
                  } ${marketLoading ? 'animate-spin' : ''}`}
                  title="Refresh live data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-yellow-400' 
                  : 'bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wallet button - hidden on mobile */}
            {wallet ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className={`hidden md:flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/20 text-white hover:bg-white/10' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                }`}
              >
                {wallet.type === 'zk-google' ? (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {wallet.type === 'zk-google' ? 'ZK Login' : 'Sui Wallet'}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="hidden md:flex bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-3 rounded-xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden py-6 border-t backdrop-blur-sm ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white'
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                      : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* Always show Admin Login on Learn page, otherwise show Session Timer when active */}
            {currentPage === 'learn' && onLearnAdminLogin ? (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onLearnAdminLogin();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark 
                      ? 'text-blue-400 hover:text-white hover:bg-white/10 border border-white/20' 
                      : 'text-blue-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Admin Login</span>
                </button>
              </div>
            ) : (
              /* Mobile Session Timer - only show when not on learn page and session is active */
              isUnlocked && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isWarning ? 'text-red-500' : isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${isWarning ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        Session: {formatTime(remainingTime)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              {wallet ? (
                <button
                  onClick={() => {
                    setShowWalletModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                      : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {wallet.type === 'zk-google' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {wallet.type === 'zk-google' ? 'ZK Login' : 'Sui Wallet'}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowWalletModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};