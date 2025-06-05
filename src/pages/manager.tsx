import React, { useState } from 'react';
import { Search, Wallet, Image, TrendingUp, TrendingDown } from 'lucide-react';

interface CoinHolding {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  balance: number;
  usdValue: number;
  riskScore: number;
  icon: string;
}

interface PortfolioTrackerProps {
  isDark?: boolean;
}

export default function PortfolioTracker({ isDark = false }: PortfolioTrackerProps) {
  const [hideOptions, setHideOptions] = useState({
    verified: 1,
    unknown: 0
  });

  const [coinHoldings] = useState<CoinHolding[]>([
    {
      id: '1',
      name: 'SUI',
      symbol: 'SUI',
      price: 3.16,
      priceChange: -2.57,
      balance: 0.0917541,
      usdValue: 0.29,
      riskScore: 7.2,
      icon: 'S'
    },
    {
      id: '2',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 62847.32,
      priceChange: 1.24,
      balance: 0.0034,
      usdValue: 213.68,
      riskScore: 3.1,
      icon: '₿'
    },
    {
      id: '3',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2456.78,
      priceChange: -0.89,
      balance: 0.0821,
      usdValue: 201.70,
      riskScore: 4.5,
      icon: 'Ξ'
    }
  ]);

  const portfolioValue = coinHoldings.reduce((sum, coin) => sum + coin.usdValue, 0);
  const nftCount = 3; // Mock NFT count

  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Medium';
    return 'High';
  };

  return (
    <div className="min-h-screen pt-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-sm"></div>
              </div>
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Account
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm sm:text-base font-mono ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  0x0475...3586
                </span>
                <button className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}>
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by Account, Coin, NFT, Package, Object, Transaction, S..."
              className={`w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl border text-sm sm:text-base ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
          </div>
        </div>

        {/* Portfolio and NFT Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Portfolio Card */}
          <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-sm border cursor-pointer hover:opacity-80 transition-opacity ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className={`w-6 h-6 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h3 className={`text-lg sm:text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Portfolio
                  </h3>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${portfolioValue.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {coinHoldings.length} items
                </div>
              </div>
            </div>
          </div>

          {/* NFT Card */}
          <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-sm border cursor-pointer hover:opacity-80 transition-opacity ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Image className={`w-6 h-6 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`text-lg sm:text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    NFTs
                  </h3>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {nftCount}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Collections
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Portfolio Section */}
        <div className={`rounded-3xl backdrop-blur-sm border overflow-hidden ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          <div className={`px-4 sm:px-8 py-6 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className={`text-xl sm:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Coin Portfolio
              </h2>
              <div className={`text-2xl sm:text-3xl font-bold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                ${portfolioValue.toFixed(2)}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {hideOptions.verified} Verified
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {hideOptions.unknown} Unknown
                </span>
              </div>
              <button className={`text-sm ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}>
                Hide Low Value
              </button>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    #
                  </th>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    NAME
                  </th>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    PRICE
                  </th>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    BALANCE
                  </th>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    USD VALUE
                  </th>
                  <th className={`px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    RISK SCORE
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'divide-white/10' : 'divide-gray-200'
              }`}>
                {coinHoldings.map((coin, index) => (
                  <tr key={coin.id} className={`hover:${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-sm sm:text-base font-medium ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 ${
                          coin.symbol === 'BTC' ? 'bg-orange-500' :
                          coin.symbol === 'ETH' ? 'bg-blue-600' :
                          coin.symbol === 'SUI' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}>
                          {coin.icon}
                        </div>
                        <div>
                          <div className={`text-sm sm:text-base font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {coin.name}
                          </div>
                          {coin.symbol === 'SUI' && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                              <span className={`text-xs ${
                                isDark ? 'text-slate-400' : 'text-gray-500'
                              }`}>
                                Verified
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div>
                        <div className={`text-sm sm:text-base font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${coin.price.toFixed(2)}
                        </div>
                        <div className={`text-xs sm:text-sm flex items-center ${
                          coin.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {coin.priceChange >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          ({coin.priceChange >= 0 ? '+' : ''}{coin.priceChange}%)
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-sm sm:text-base font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-900'
                    }`}>
                      {coin.balance.toFixed(7)} {coin.symbol}
                    </td>
                    <td className={`px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-sm sm:text-base font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${coin.usdValue.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm sm:text-base font-semibold ${getRiskScoreColor(coin.riskScore)}`}>
                          {coin.riskScore.toFixed(1)}
                        </span>
                        <span className={`text-xs ${getRiskScoreColor(coin.riskScore)}`}>
                          {getRiskScoreLabel(coin.riskScore)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}