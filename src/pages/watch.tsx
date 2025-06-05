import React, { useState } from 'react';
import { X, Plus, Upload, Download, Settings, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  change24h: number;
  icon: string;
}

interface PortfolioPageProps {
  isDark: boolean;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isDark }) => {
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const [holdings, setHoldings] = useState<Token[]>([
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.25,
      value: 8720.50,
      change24h: 2.5,
      icon: '₿'
    },
    {
      id: '2',
      name: 'Sui',
      symbol: 'SUI',
      amount: 1250,
      value: 3875.00,
      change24h: -1.2,
      icon: 'S'
    },
    {
      id: '3',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 1.5,
      value: 3240.75,
      change24h: 4.1,
      icon: 'Ξ'
    },
    {
      id: '4',
      name: 'Binance',
      symbol: 'BNB',
      amount: 5,
      value: 1230.25,
      change24h: -0.8,
      icon: 'B'
    },
    {
      id: '5',
      name: 'Solana',
      symbol: 'SOL',
      amount: 15,
      value: 300.00,
      change24h: 6.3,
      icon: 'S'
    }
  ]);

  const totalValue = holdings.reduce((sum, token) => sum + token.value, 0);
  const totalTokens = holdings.length;
  const totalChange24h = holdings.reduce((sum, token) => sum + (token.value * token.change24h / 100), 0);

  const handleAddToken = () => {
    if (tokenSymbol && tokenAmount && purchasePrice) {
      const newToken: Token = {
        id: Date.now().toString(),
        name: tokenSymbol.toUpperCase(),
        symbol: tokenSymbol.toUpperCase(),
        amount: parseFloat(tokenAmount),
        value: parseFloat(tokenAmount) * parseFloat(purchasePrice),
        change24h: 0,
        icon: tokenSymbol.charAt(0).toUpperCase()
      };
      setHoldings([...holdings, newToken]);
      setTokenSymbol('');
      setTokenAmount('');
      setPurchasePrice('');
      setShowAddToken(false);
    }
  };

  const quickActions = [
    { name: 'Add New Token', icon: Plus, action: () => setShowAddToken(true), description: 'Add a new cryptocurrency to your portfolio' },
    { name: 'Import Portfolio', icon: Upload, action: () => {}, description: 'Import portfolio data from CSV or exchange' },
    { name: 'Export Data', icon: Download, action: () => {}, description: 'Export your portfolio data and reports' },
    { name: 'Settings', icon: Settings, action: () => {}, description: 'Configure portfolio settings and preferences' }
  ];

  return (
    <div className="min-h-screen pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Manage Portfolio
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Portfolio Section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Total Value
                  </p>
                  <p className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="text-center">
                  <p className={`text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Total Tokens
                  </p>
                  <p className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {totalTokens}
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="text-center">
                  <p className={`text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    24h Change
                  </p>
                  <p className={`text-2xl font-bold ${
                    totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {totalChange24h >= 0 ? '+' : ''}${totalChange24h.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="text-center">
                  <p className={`text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Best Performer
                  </p>
                  <p className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    SOL
                  </p>
                  <p className="text-sm text-green-500">+6.3%</p>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className={`rounded-3xl backdrop-blur-sm border overflow-hidden ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white border-gray-200 shadow-xl'
            }`}>
              <div className={`px-8 py-6 border-b ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Your Holdings
                  </h2>
                  <button
                    onClick={() => setShowAddToken(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Add Token
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}>
                      <th className={`px-8 py-4 text-left text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Asset
                      </th>
                      <th className={`px-8 py-4 text-left text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Amount
                      </th>
                      <th className={`px-8 py-4 text-left text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Value
                      </th>
                      <th className={`px-8 py-4 text-left text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        24h Change
                      </th>
                      <th className={`px-8 py-4 text-left text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-white/10' : 'divide-gray-200'
                  }`}>
                    {holdings.map((token) => (
                      <tr key={token.id} className={`hover:${
                        isDark ? 'bg-white/5' : 'bg-gray-50'
                      } transition-colors`}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                              token.symbol === 'BTC' ? 'bg-orange-500' :
                              token.symbol === 'ETH' ? 'bg-blue-600' :
                              token.symbol === 'SUI' ? 'bg-blue-500' :
                              token.symbol === 'BNB' ? 'bg-yellow-500' :
                              token.symbol === 'SOL' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`}>
                              {token.icon}
                            </div>
                            <div>
                              <div className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {token.name}
                              </div>
                              <div className={`text-sm ${
                                isDark ? 'text-slate-400' : 'text-gray-500'
                              }`}>
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap text-lg font-medium ${
                          isDark ? 'text-slate-300' : 'text-gray-900'
                        }`}>
                          {token.amount.toLocaleString()}
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap text-lg font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${token.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className={`flex items-center text-lg font-semibold ${
                            token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {token.change24h >= 0 ? (
                              <TrendingUp className="w-5 h-5 mr-2" />
                            ) : (
                              <TrendingDown className="w-5 h-5 mr-2" />
                            )}
                            {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <button className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                            isDark 
                              ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="xl:col-span-1">
            <div className={`p-8 rounded-3xl backdrop-blur-sm border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white border-gray-200 shadow-xl'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`w-full p-4 rounded-xl border text-left transition-colors group ${
                      isDark 
                        ? 'border-white/10 hover:bg-white/5' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isDark ? 'bg-white/10' : 'bg-gray-100'
                      } group-hover:bg-gradient-to-r group-hover:from-[#2F5A8A] group-hover:to-[#437AF3] transition-all`}>
                        <action.icon className={`w-5 h-5 ${
                          isDark ? 'text-slate-300' : 'text-gray-600'
                        } group-hover:text-white transition-colors`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {action.name}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Token Modal */}
        {showAddToken && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-lg rounded-3xl border ${
              isDark 
                ? 'bg-slate-900/95 border-white/10' 
                : 'bg-white border-gray-200'
            } backdrop-blur-sm`}>
              <div className={`flex items-center justify-between p-8 border-b ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Token
                </h3>
                <button
                  onClick={() => setShowAddToken(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="e.g., BTC, ETH, SUI"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Purchase Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddToken(false)}
                    className={`flex-1 px-6 py-3 rounded-xl border font-semibold transition-colors ${
                      isDark 
                        ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToken}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Add Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};