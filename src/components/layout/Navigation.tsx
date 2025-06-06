import React from 'react';
import { Sun, Moon, Menu, X, Wallet, User, RefreshCw } from 'lucide-react';
import type { WalletConnection } from '../../types/index';
import type { PageType, ThemeType } from '../../types/index';
import type { Token } from '../../types/index';

import LightLogo from './light.svg';
import DarkLogo from './dark.svg';

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
  setSearchQuery
}) => {
  const isDark = theme === 'dark';

  const navigationItems = [
    { name: 'Home', id: 'home' as PageType },
    { name: 'Watch', id: 'watch' as PageType },
    { name: 'Learn', id: 'learn' as PageType },
    { name: 'Manager', id: 'manager' as PageType }
  ];

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
                    className={`h-full object-contain transition-all duration-300 ${
                      isDark ? 'w-[200px]' : 'w-[250px]'
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
            {/* Refresh button - hidden on mobile */}
            <button
              onClick={refetch}
              disabled={marketLoading}
              className={`hidden md:block p-3 rounded-xl backdrop-blur-sm  transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? ' text-blue-400' 
                  : ' text-blue-600'
              } ${marketLoading ? 'animate-spin' : ''}`}
              title="Refresh live data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

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