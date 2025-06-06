import React, { useState } from 'react';
import { Book, TrendingUp, Shield, Users, ArrowRight, CheckCircle, Star, BarChart3, PieChart, Activity, ArrowLeft, Wallet, X } from 'lucide-react';

// Back Button Component
interface BackButtonProps {
  onClick: () => void;
  isDark: boolean;
  label: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, isDark, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 mb-6 ${
      isDark 
        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600' 
        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
    }`}
  >
    <ArrowLeft size={18} />
    <span className="font-medium">Back to {label}</span>
  </button>
);

// Wallet Connection Popup
interface WalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  isDark: boolean;
}

const WalletPopup: React.FC<WalletPopupProps> = ({ isOpen, onClose, onConnect, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`relative max-w-md w-full rounded-2xl p-6 transform transition-all duration-300 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            isDark ? 'hover:bg-slate-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
          
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Connect Your Wallet
          </h3>
          
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            You need to connect your wallet to create posts and access the Portfolio Dashboard.
          </p>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConnect}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component Props Interface
interface DashboardProps {
  isDark: boolean;
  onNavigateToLearn: () => void;
  onNavigateToAdmin: () => void;
}

// Dashboard Component
const Dashboard: React.FC<DashboardProps> = ({ isDark, onNavigateToLearn, onNavigateToAdmin }) => {
  const stats = [
    { label: 'Total Posts', value: 12, color: 'text-blue-400' },
    { label: 'Total Likes', value: 154, color: 'text-red-400' },
    { label: 'Total Comments', value: 25, color: 'text-blue-400' }
  ];

  const menuItems = [
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ), 
      label: 'Create Post', 
      active: false,
      onClick: onNavigateToAdmin
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      label: 'My Post', 
      active: true,
      onClick: () => console.log('My Post clicked')
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      label: 'Analytics', 
      active: false,
      onClick: () => console.log('Analytics clicked')
    }
  ];

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
      isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        {/* Back Button */}
        <BackButton 
          onClick={onNavigateToLearn} 
          isDark={isDark} 
          label="Learn" 
        />

        {/* Dashboard Title */}
        <h1 className={`text-3xl font-bold text-center mb-12 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Portfolio Dashboard
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">AJ</span>
                </div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Alex Johnson
                </h3>
              </div>
            </div>

            {/* Stats */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Your Stats
              </h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {stat.label}
                    </span>
                    <span className={`font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Menu */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-[#2F5A8A]/20 to-[#437AF3]/20 text-blue-400 border border-blue-500/20'
                        : isDark
                          ? 'hover:bg-white/5 text-slate-300 hover:text-white'
                          : 'hover:bg-gray-50 text-slate-600 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Create New Post */}
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-2xl backdrop-blur-sm border text-center h-full flex flex-col justify-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <svg className={`w-10 h-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              <h3 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Create New Post
              </h3>
              
              <p className={`mb-8 leading-relaxed text-lg max-w-2xl mx-auto ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Share your knowledge, tutorials, insights, or discussions with the ChainCheck community. Your content helps other learn and grow in the blockchain space.
              </p>
              
              <button 
                onClick={onNavigateToAdmin}
                className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 mx-auto"
              >
                Start Writing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Component Props Interface
interface AdminProps {
  isDark: boolean;
  onNavigateToDashboard: () => void;
}

// Admin Component
const Admin: React.FC<AdminProps> = ({ isDark, onNavigateToDashboard }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    title: '',
    niche: '',
    content: '',
    acceptDonation: false
  });

  const nicheOptions = [
    'Security',
    'Infrastructure', 
    'Analytics',
    'Risk Management',
    'Research'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setFormData(prev => ({
            ...prev,
            image: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
      isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        
        {/* Back Button */}
        <BackButton 
          onClick={onNavigateToDashboard} 
          isDark={isDark} 
          label="Dashboard" 
        />

        {/* Page Title */}
        <h1 className={`text-3xl font-bold text-center mb-12 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Admin Panel
        </h1>

        {/* Main Form Container */}
        <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          
          <div className="space-y-8">
            
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter blog post title"
                />
              </div>
            </div>

            {/* Niche Dropdown */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Niche *
              </label>
              <select
                name="niche"
                value={formData.niche}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="" disabled>Select a niche</option>
                {nicheOptions.map((option) => (
                  <option 
                    key={option} 
                    value={option}
                    className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Featured Image
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image URL Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4' 
                        : 'bg-white border-gray-300 text-gray-900 file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4'
                    }`}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Image Preview:
                  </p>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Blog Content */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Blog Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={8}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Write your blog content here... Use markdown for formatting."
              />
            </div>

            {/* Accept Donation Checkbox */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptDonation"
                  checked={formData.acceptDonation}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Accept Donations
                  </span>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Allow readers to support your work through donations
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
              >
                Publish Post
              </button>
              
              <button
                type="button"
                className={`flex-1 px-8 py-4 rounded-xl font-semibold border transition-all duration-200 ${
                  isDark 
                    ? 'border-white/20 text-white hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Types
interface Article {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
}

// Utility function
const getCategoryStyle = (category: string, isDark: boolean) => {
  const baseClasses = isDark ? 'border-white/20' : 'border-gray-200';
  
  switch (category) {
    case 'Security':
      return `bg-red-500/10 text-red-400 border-red-500/20 ${baseClasses}`;
    case 'Infrastructure':
      return `bg-blue-500/10 text-blue-400 border-blue-500/20 ${baseClasses}`;
    case 'Analytics':
      return `bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ${baseClasses}`;
    case 'Risk Management':
      return `bg-orange-500/10 text-orange-400 border-orange-500/20 ${baseClasses}`;
    case 'Research':
      return `bg-purple-500/10 text-purple-400 border-purple-500/20 ${baseClasses}`;
    default:
      return `bg-gray-500/10 text-gray-400 border-gray-500/20 ${baseClasses}`;
  }
};

interface LearnPageProps {
  isDark: boolean;
  onNavigateToDashboard?: () => void; // Optional prop for backward compatibility
  wallet?: any; // Wallet connection state from Navigation
  onShowWalletModal?: () => void; // Function to show wallet connection modal
}

export const LearnPage: React.FC<LearnPageProps> = ({ isDark, onNavigateToDashboard, wallet, onShowWalletModal }) => {
  // Navigation state for sub-pages
  const [currentSubPage, setCurrentSubPage] = useState<'learn' | 'dashboard' | 'admin'>('learn');
  // Wallet popup state
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  // Handle Post button click with wallet check
  const handlePostClick = () => {
    if (wallet) {
      // User has wallet connected, proceed to dashboard
      setCurrentSubPage('dashboard');
    } else {
      // No wallet connected, show popup
      setShowWalletPopup(true);
    }
  };

  // Handle wallet connection from popup
  const handleConnectWallet = () => {
    setShowWalletPopup(false);
    if (onShowWalletModal) {
      onShowWalletModal();
    }
  };

  const articles: Article[] = [
    {
      title: "Sui Blockchain Architecture Deep Dive",
      excerpt: "Understanding Sui's parallel execution model, object-centric design, and Move programming language for institutional applications.",
      category: "Infrastructure",
      readTime: "12 min read",
      date: "May 28, 2025",
      author: "Dr. Sarah Chen"
    },
    {
      title: "Institutional DeFi Risk Management",
      excerpt: "Advanced frameworks for assessing smart contract risks, liquidity risks, and regulatory considerations in DeFi protocols.",
      category: "Risk Management",
      readTime: "18 min read",
      date: "May 27, 2025",
      author: "Michael Rodriguez"
    },
    {
      title: "On-Chain Analytics for Professional Traders",
      excerpt: "Leveraging blockchain data science for alpha generation, market microstructure analysis, and systematic trading strategies.",
      category: "Analytics",
      readTime: "15 min read",
      date: "May 26, 2025",
      author: "Prof. James Liu"
    },
    {
      title: "Move Smart Contract Security Audit Guide",
      excerpt: "Comprehensive methodologies for auditing Move smart contracts, common vulnerabilities, and best security practices.",
      category: "Security",
      readTime: "22 min read",
      date: "May 25, 2025",
      author: "Alex Thompson"
    },
    {
      title: "Tokenomics Analysis for Institutional Investors",
      excerpt: "Advanced frameworks for evaluating token economics, governance mechanisms, and long-term value accrual models.",
      category: "Research",
      readTime: "16 min read",
      date: "May 24, 2025",
      author: "Dr. Maria Santos"
    },
    {
      title: "Cross-Chain Bridge Security Assessment",
      excerpt: "Professional methodologies for evaluating bridge security, monitoring tools, and risk mitigation strategies.",
      category: "Security",
      readTime: "14 min read",
      date: "May 23, 2025",
      author: "David Kim"
    }
  ];

  const categories = ['All', 'Security', 'Infrastructure', 'Analytics', 'Risk Management', 'Research'];

  // Navigation functions
  const navigateToDashboard = () => setCurrentSubPage('dashboard');
  const navigateToAdmin = () => setCurrentSubPage('admin');
  const navigateToLearn = () => setCurrentSubPage('learn');

  // Render current sub-page
  if (currentSubPage === 'dashboard') {
    return (
      <Dashboard
        isDark={isDark}
        onNavigateToLearn={navigateToLearn}
        onNavigateToAdmin={navigateToAdmin}
      />
    );
  }

  if (currentSubPage === 'admin') {
    return (
      <Admin
        isDark={isDark}
        onNavigateToDashboard={() => setCurrentSubPage('dashboard')}
      />
    );
  }

  // Default Learn page content
  return (
    <div className="min-h-screen pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <h1 className={`text-4xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Research & Intelligence Hub
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Professional insights, research papers, and analysis from leading blockchain experts and institutional researchers
          </p>
          
          {/* Post Button - Professional placement in top-right */}
          <button 
            onClick={handlePostClick}
            className={`absolute top-0 right-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${
              isDark 
                ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white' 
                : 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {wallet ? 'Create Post' : 'Post'}
            {wallet && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-1">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Categories filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                category === 'All' 
                  ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white border-transparent'
                  : isDark 
                    ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10' 
                    : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={index}
              className={`group p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 cursor-pointer ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-xl'
              }`}
            >
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-6 ${getCategoryStyle(article.category, isDark)}`}>
                {article.category}
              </div>
              
              <h3 className={`text-xl font-bold mb-4 leading-tight group-hover:text-blue-500 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {article.title}
              </h3>
              
              <p className={`leading-relaxed mb-6 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {article.excerpt}
              </p>
              
              <div className={`flex items-center justify-between text-sm border-t pt-4 ${
                isDark ? 'border-white/10 text-slate-400' : 'border-gray-200 text-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                    index % 4 === 0 ? 'from-blue-500 to-purple-600' :
                    index % 4 === 1 ? 'from-emerald-500 to-teal-600' :
                    index % 4 === 2 ? 'from-orange-500 to-red-600' :
                    'from-purple-500 to-pink-600'
                  }`}></div>
                  <span className="font-medium">{article.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{article.readTime}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className={`mt-20 p-12 rounded-3xl backdrop-blur-sm border text-center ${
          isDark 
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/20' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
        }`}>
          <h3 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Professional Research Updates
          </h3>
          <p className={`mb-8 max-w-2xl mx-auto ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Get exclusive access to institutional-grade research, market intelligence, and technical analysis from our team of experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your professional email"
              className={`flex-1 px-4 py-3 rounded-xl border backdrop-blur-sm ${
                isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>

        {/* Wallet Connection Popup */}
        <WalletPopup
          isOpen={showWalletPopup}
          onClose={() => setShowWalletPopup(false)}
          onConnect={handleConnectWallet}
          isDark={isDark}
        />
      </div>
    </div>
  );
};