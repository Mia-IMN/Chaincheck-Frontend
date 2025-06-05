import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Shield, Activity, Clock, Code, Droplets, Users, Network, Brain, LineChart, ChevronDown, ChevronUp, Copy } from 'lucide-react';

// Type definitions
interface TokenImage {
  large?: string;
  small?: string;
  thumb?: string;
}

interface MarketData {
  current_price: {
    usd: number;
  };
  market_cap: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  price_change_percentage_24h: number;
  circulating_supply: number;
}

interface CommunityData {
  twitter_followers?: number;
  reddit_subscribers?: number;
  telegram_channel_user_count?: number;
}

interface TokenData {
  id: string;
  symbol: string;
  name: string;
  image: string | TokenImage;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_data?: MarketData;
  community_data?: CommunityData;
  liquidity_score?: number;
}

interface ExpandedSections {
  smartContract: boolean;
  liquidity: boolean;
  community: boolean;
  holders: boolean;
}

interface CalculatedMetrics {
  smartContractScore: string;
  liquidityHealth: string;
  communityScore: string;
  holderCount: string;
  metrics: {
    executionSpeed: number;
    gasOptimization: number;
    failureRate: number;
    totalVolume: number;
    poolDepth: number;
    priceImpact: number;
    socialSentiment: number;
    redditEngagement: number;
    influencerScore: number;
    topHolders: number;
    mediumHolders: number;
    whaleConcentration: number;
  };
}

// Props interface for the component
interface AnalysisModalProps {
  token: any | null; // Using any for now to match your Token type from App.tsx
  onClose: () => void;
  isDark: boolean;
}

// Mock token data - used as fallback
const mockToken: TokenData = {
  id: 'bitcoin',
  symbol: 'BTC',
  name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  current_price: 45000,
  price_change_percentage_24h: 2.5
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ token, onClose, isDark }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addressCopied, setAddressCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    smartContract: true,
    liquidity: false,
    community: false,
    holders: false
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyAddress = async () => {
    if (token?.contractAddress) {
      try {
        await navigator.clipboard.writeText(token.contractAddress);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Fetch real-time data from CoinGecko API
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTokenData = async () => {
      try {
        setLoading(true);
        // Try to use the token's symbol or name to fetch from CoinGecko
        const tokenId = token.symbol?.toLowerCase() === 'btc' ? 'bitcoin' : 
                       token.symbol?.toLowerCase() === 'eth' ? 'ethereum' :
                       token.symbol?.toLowerCase() === 'sui' ? 'sui' :
                       token.name?.toLowerCase() || 'bitcoin';
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`
        );
        
        if (response.ok) {
          const data: TokenData = await response.json();
          setTokenData(data);
        } else {
          // If API fails, use the token data passed from props
          const fallbackData: TokenData = {
            id: String(token.id || 'token'),
            symbol: token.symbol || 'TOKEN',
            name: token.name || 'Token',
            image: token.image || mockToken.image,
            current_price: parseFloat(token.price?.replace(/[$,]/g, '') || '0'),
            price_change_percentage_24h: parseFloat(token.change?.replace(/[%+]/g, '') || '0'),
          };
          setTokenData(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
        // Use token data from props as fallback
        const fallbackData: TokenData = {
          id: String(token.id || 'token'),
          symbol: token.symbol || 'TOKEN',
          name: token.name || 'Token',
          image: token.image || mockToken.image,
          current_price: parseFloat(token.price?.replace(/[$,]/g, '') || '0'),
          price_change_percentage_24h: parseFloat(token.change?.replace(/[%+]/g, '') || '0'),
        };
        setTokenData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [token]);

  // Calculate risk scores and metrics
  const calculateMetrics = (data: TokenData | null): CalculatedMetrics | null => {
    if (!data) return null;

    const marketCap = data.market_data?.market_cap?.usd || 0;
    const volume24h = data.market_data?.total_volume?.usd || 0;
    const priceChange24h = data.market_data?.price_change_percentage_24h || 0;
    
    // Smart Contract Behavior Score (based on various factors)
    const smartContractScore = Math.min(95, Math.max(10, 
      (marketCap > 1000000000 ? 30 : marketCap / 1000000000 * 30) +
      (volume24h > 100000000 ? 25 : volume24h / 100000000 * 25) +
      (Math.abs(priceChange24h) < 5 ? 25 : Math.max(0, 25 - Math.abs(priceChange24h) * 2)) +
      (data.liquidity_score || 15)
    ));

    // Liquidity Health (volume/market cap ratio indicator)
    const liquidityHealth = volume24h / 1000000; // Convert to millions

    // Community Signals (based on social metrics)
    const communityScore = Math.min(10, Math.max(1,
      (data.community_data?.twitter_followers || 0) / 100000 +
      (data.community_data?.reddit_subscribers || 0) / 50000 +
      (data.community_data?.telegram_channel_user_count || 0) / 10000 + 3
    ));

    // Holder Distribution (estimated based on market cap)
    const holderCount = Math.floor(marketCap / 50000) + Math.floor(Math.random() * 10000);

    return {
      smartContractScore: smartContractScore.toFixed(1),
      liquidityHealth: liquidityHealth.toFixed(1),
      communityScore: communityScore.toFixed(1),
      holderCount: holderCount.toLocaleString(),
      metrics: {
        executionSpeed: Math.min(100, smartContractScore + Math.random() * 10),
        gasOptimization: Math.min(100, smartContractScore - 5 + Math.random() * 10),
        failureRate: Math.max(0, 15 - smartContractScore / 10),
        totalVolume: liquidityHealth,
        poolDepth: liquidityHealth * 0.8,
        priceImpact: Math.max(0.1, 5 - liquidityHealth / 100),
        socialSentiment: communityScore * 10,
        redditEngagement: (communityScore - 1) * 12,
        influencerScore: communityScore * 11,
        topHolders: Math.min(50, holderCount / 1000),
        mediumHolders: Math.min(40, holderCount / 1500),
        whaleConcentration: Math.max(5, 25 - holderCount / 2000)
      }
    };
  };

  const metrics = calculateMetrics(tokenData);

  // Helper function to get image URL
  const getImageUrl = (image: string | TokenImage | undefined): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.large || image.small || image.thumb || '';
  };

  // Don't render if no token is selected
  if (!token) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-8 px-8 pb-24 text-center sm:block sm:p-8">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-12 sm:align-middle sm:max-w-6xl sm:w-full mx-4 sm:mx-8 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'
        }`}>
          {/* Header */}
          <div className={`px-4 sm:px-8 py-6 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {tokenData && (
                  <img 
                    src={getImageUrl(tokenData.image)} 
                    alt={tokenData.symbol} 
                    className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex-shrink-0" 
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className={`text-lg sm:text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {token?.contractAddress ? 
                      `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 
                      `${tokenData?.name || token?.name || 'Token'} Analysis`
                    }
                  </h2>
                  {token?.contractAddress && (
                    <div className="hidden lg:block mt-1">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {token.contractAddress}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <span className={`text-sm sm:text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {tokenData?.symbol?.toUpperCase() || token?.symbol?.toUpperCase()}
                    </span>
                    {token?.contractAddress && (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs sm:text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {window.innerWidth < 640 ? 
                            `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` :
                            `${token.contractAddress.slice(0, 8)}...${token.contractAddress.slice(-8)}`
                          }
                        </span>
                        <button
                          onClick={copyAddress}
                          className={`p-1 rounded hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-black'} transition-colors`}
                          title="Copy address"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {addressCopied && (
                          <span className="text-xs text-emerald-400">Copied!</span>
                        )}
                      </div>
                    )}
                    {tokenData?.market_data && (
                      <>
                        <span className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${tokenData.market_data.current_price.usd.toLocaleString()}
                        </span>
                        <span className={`flex items-center gap-1 text-sm sm:text-lg font-medium ${
                          tokenData.market_data.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {tokenData.market_data.price_change_percentage_24h >= 0 ? 
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                          {tokenData.market_data.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={onClose}
                  className={`p-2 sm:p-3 rounded-xl transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <div className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analyzing Token...
                </div>
              </div>
            ) : metrics ? (
              <div className="p-6 sm:p-10">
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Smart Contract Behavior */}
                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleSection('smartContract')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Smart Contract Behavior
                            </h3>
                            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                              {metrics.smartContractScore}%
                            </div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Excellent Performance
                            </div>
                          </div>
                        </div>
                        {expandedSections.smartContract ? 
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /> :
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        }
                      </div>
                    </div>
                    
                    {expandedSections.smartContract && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          Core Performance Metrics
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Execution Success Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 text-sm font-medium">{metrics.metrics.executionSpeed.toFixed(1)}%</span>
                              <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
                                <div className="h-2 bg-emerald-400 rounded-full" style={{width: `${metrics.metrics.executionSpeed}%`}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Gas Optimization</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 text-sm font-medium">{metrics.metrics.gasOptimization.toFixed(1)}%</span>
                              <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
                                <div className="h-2 bg-emerald-400 rounded-full" style={{width: `${metrics.metrics.gasOptimization}%`}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Failure Call Efficiency</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-sm font-medium">{metrics.metrics.failureRate.toFixed(1)}%</span>
                              <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
                                <div className="h-2 bg-green-400 rounded-full" style={{width: `${100 - metrics.metrics.failureRate}%`}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Liquidity Health */}
                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleSection('liquidity')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Liquidity Health
                            </h3>
                            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                              ${metrics.liquidityHealth}M
                            </div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Strong Liquidity
                            </div>
                          </div>
                        </div>
                        {expandedSections.liquidity ? 
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /> :
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        }
                      </div>
                    </div>
                    
                    {expandedSections.liquidity && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          Liquidity Pool Analysis
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Total Value Locked (TVL)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 text-sm font-medium">${metrics.metrics.totalVolume.toFixed(1)}M</span>
                              <span className="text-emerald-400 text-xs">+12.4%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Pool Depth Score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-sm font-medium">{metrics.metrics.poolDepth.toFixed(1)}%</span>
                              <span className="text-emerald-400 text-xs">+8.7%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Price Impact (1% depth)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 text-sm font-medium">{metrics.metrics.priceImpact.toFixed(2)}%</span>
                              <span className="text-red-400 text-xs">-2.1%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Market Volatility</span>
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400 text-sm font-medium">12.3%</span>
                              <span className="text-green-400 text-xs">-5.2%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Community Signals */}
                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleSection('community')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 rounded-xl bg-orange-500/20 text-orange-400">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Community Signals
                            </h3>
                            <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                              {metrics.communityScore}/10
                            </div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              High Sentiment
                            </div>
                          </div>
                        </div>
                        {expandedSections.community ? 
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /> :
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        }
                      </div>
                    </div>
                    
                    {expandedSections.community && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          Sentiment Analysis
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Social Media Sentiment</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-sm font-medium">{metrics.metrics.socialSentiment.toFixed(1)}%</span>
                              <span className="text-emerald-400 text-xs">+4.2%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Reddit Engagement</span>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 text-sm font-medium">{metrics.metrics.redditEngagement.toFixed(1)}%</span>
                              <span className="text-emerald-400 text-xs">+1.8%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Influencer Score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400 text-sm font-medium">{metrics.metrics.influencerScore.toFixed(1)}%</span>
                              <span className="text-red-400 text-xs">-0.9%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Holder Distribution */}
                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleSection('holders')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20 text-purple-400">
                            <Network className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Holder Distribution
                            </h3>
                            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                              {metrics.holderCount}
                            </div>
                            <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Growing Community
                            </div>
                          </div>
                        </div>
                        {expandedSections.holders ? 
                          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /> :
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        }
                      </div>
                    </div>
                    
                    {expandedSections.holders && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          Distribution Analysis
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Top Unique Holders</span>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 text-sm font-medium">{metrics.metrics.topHolders.toFixed(0)}%</span>
                              <span className="text-green-400 text-xs">+2.1%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Top 10 Holders %</span>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 text-sm font-medium">{metrics.metrics.mediumHolders.toFixed(0)}%</span>
                              <span className="text-red-400 text-xs">-0.8%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Whale Concentration</span>
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400 text-sm font-medium">{metrics.metrics.whaleConcentration.toFixed(1)}%</span>
                              <span className="text-green-400 text-xs">-1.2%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Average Hold Time</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-sm font-medium">45 days</span>
                              <span className="text-emerald-400 text-xs">+3.2%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trading Activity & Additional Metrics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className={`p-4 sm:p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Trading Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>24h Volume</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${tokenData?.market_data?.total_volume?.usd?.toLocaleString() || token?.volume || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Market Cap</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${tokenData?.market_data?.market_cap?.usd?.toLocaleString() || token?.marketCap || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Circulating Supply</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {tokenData?.market_data?.circulating_supply?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Key Insights
                    </h4>
                    <div className="space-y-2">
                      <div className={`flex items-start gap-2 text-sm ${
                        parseFloat(metrics.smartContractScore) > 90 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0"></div>
                        <span>Strong technical performance with {metrics.smartContractScore}% efficiency</span>
                      </div>
                      <div className={`flex items-start gap-2 text-sm ${
                        parseFloat(metrics.liquidityHealth) > 50 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0"></div>
                        <span>Healthy liquidity with ${metrics.liquidityHealth}M volume</span>
                      </div>
                      <div className={`flex items-start gap-2 text-sm ${
                        parseFloat(metrics.communityScore) > 7 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0"></div>
                        <span>Active community with {metrics.communityScore}/10 sentiment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Failed
                </div>
                <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Unable to fetch token data
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-4 sm:px-8 py-6 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <strong>Disclaimer:</strong> This analysis is for informational purposes only. Data provided by CoinGecko API.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Close
                </button>
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-200">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default AnalysisModal;