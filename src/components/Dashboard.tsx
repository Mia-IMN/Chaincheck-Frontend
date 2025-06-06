import React from 'react';

interface DashboardProps {
  isDark: boolean;
  onNavigateToLearn?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDark, onNavigateToLearn, onNavigateToAdmin }) => {
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
        <button
          onClick={onNavigateToLearn}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all duration-200 ${
            isDark 
              ? 'text-slate-300 hover:text-white hover:bg-white/5' 
              : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Learn
        </button>

        {/* Dashboard Title */}
        <h1 className={`text-3xl font-bold text-center mb-12 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Dashboard
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

export default Dashboard;