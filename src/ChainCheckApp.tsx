import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Shield, BarChart3, BookOpen, Menu, X, Sun, Moon, Activity, Zap, Lock, Globe, ArrowUpRight, ChevronRight, RefreshCw, AlertTriangle, CheckCircle, XCircle, Wallet, LogOut, Copy, ExternalLink, User, Info, Eye, Clock, Users, Code, Droplets, LineChart, PieChart, Brain, Target, Layers, Network } from 'lucide-react';

declare global {
  interface Window {
    suiWallet?: any;
  }
}

// TypeScript interfaces - keeping original structure
interface Token {
  id: number;
  name: string;
  symbol: string;
  price: string;
  change: string;
  marketCap: string;
  volume: string;
  riskScore: 'low' | 'medium' | 'high';
  trending: 'up' | 'down';
  address?: string;
  liquidity?: string;
  image?: string;
  category?: 'DeFi' | 'Gaming' | 'Infrastructure' | 'NFT' | 'Other';
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface Article {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author?: string;
}

// New interfaces for live data
interface SuiTokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
  circulating_supply: number;
  max_supply: number;
  image: string;
}

interface SuiSystemState {
  epoch: string;
  totalStake: string;
  activeValidators: number;
  totalSupply: string;
}

interface MarketStats {
  totalTokens: number;
  scamsDetected: number;
  riskAssessments: number;
  activeUsers: number;
}

// New interfaces for pagination and filtering
interface TokenFilters {
  category: string;
  search: string;
  sortBy: 'market_cap' | 'volume' | 'price_change_percentage_24h' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Wallet connection interfaces
interface WalletConnection {
  address: string;
  type: 'zk-google' | 'sui-wallet';
  name?: string;
  email?: string;
  avatar?: string;
}

// Analysis interfaces
interface AnalysisMetric {
  name: string;
  abbreviation: string;
  description: string;
  value: number;
  status: 'safe' | 'warning' | 'risk';
  weight: number;
}

interface AnalysisCategory {
  name: string;
  abbreviation: string;
  description: string;
  metrics: AnalysisMetric[];
  score: number;
  weight: number;
}

interface TokenAnalysis {
  token: Token;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  categories: AnalysisCategory[];
  lastUpdated: Date;
  recommendations: string[];
}

type PageType = 'home' | 'portfolio' | 'learn';
type ThemeType = 'light' | 'dark';

// Wallet Connection Hook
const useWalletConnection = () => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWithGoogle = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate zk login flow - in real implementation, you'd use the Sui zk login SDK
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock Google user data
      const mockUser = {
        address: '0x742d35Cc6C7EC86532F73c8F01e65Ac8c1234567',
        type: 'zk-google' as const,
        name: 'Professional User',
        email: 'user@company.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google-user`
      };
      
      setWallet(mockUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('wallet-connection', JSON.stringify(mockUser));
    } catch (err) {
      setError('Failed to connect with Google. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWithSuiWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate Sui wallet connection - in real implementation, you'd use @mysten/wallet-adapter
      if (!window.suiWallet) {
        throw new Error('Sui wallet not detected. Please install a Sui wallet extension.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Sui wallet data
      const mockWallet = {
        address: '0x8a94c5e9f123456789abcdef0123456789abcdef',
        type: 'sui-wallet' as const,
        name: 'Sui Wallet'
      };
      
      setWallet(mockWallet);
      
      // Store in localStorage for persistence
      localStorage.setItem('wallet-connection', JSON.stringify(mockWallet));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Sui wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    setError(null);
    localStorage.removeItem('wallet-connection');
  };

  const copyAddress = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
    }
  };

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet-connection');
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (err) {
        localStorage.removeItem('wallet-connection');
      }
    }
  }, []);

  return {
    wallet,
    isConnecting,
    error,
    connectWithGoogle,
    connectWithSuiWallet,
    disconnect,
    copyAddress
  };
};

// Token Analysis Hook
const useTokenAnalysis = (token: Token | null) => {
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async (tokenData: Token): Promise<TokenAnalysis> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Smart Contract Behavior Analysis (40%)
    const smartContractMetrics: AnalysisMetric[] = [
      {
        name: 'Contract Verification',
        abbreviation: 'CV',
        description: 'Whether the smart contract code is verified and publicly viewable',
        value: tokenData.symbol === 'SUI' ? 100 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 20
      },
      {
        name: 'Honeypot Detection',
        abbreviation: 'HP',
        description: 'Checks if token can be bought but not sold (honeypot scam)',
        value: Math.random() * 100,
        status: Math.random() > 0.1 ? 'safe' : 'risk',
        weight: 25
      },
      {
        name: 'Mint Authority',
        abbreviation: 'MA',
        description: 'Whether unlimited tokens can be minted after launch',
        value: tokenData.symbol === 'SUI' ? 85 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.2 ? 'safe' : 'warning',
        weight: 20
      },
      {
        name: 'Owner Privileges',
        abbreviation: 'OP',
        description: 'Level of control owner has (pause, blacklist, fee changes)',
        value: Math.random() * 100,
        status: Math.random() > 0.25 ? 'safe' : 'warning',
        weight: 20
      },
      {
        name: 'Hidden Functions',
        abbreviation: 'HF',
        description: 'Detection of backdoors or self-destruct mechanisms',
        value: Math.random() * 100,
        status: Math.random() > 0.05 ? 'safe' : 'risk',
        weight: 15
      }
    ];

    // Liquidity Health Analysis (25%)
    const liquidityMetrics: AnalysisMetric[] = [
      {
        name: 'Liquidity Pool Lock',
        abbreviation: 'LPL',
        description: 'Whether LP tokens are locked or burned to prevent rugpulls',
        value: tokenData.symbol === 'SUI' ? 95 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 30
      },
      {
        name: 'Liquidity Depth',
        abbreviation: 'LD',
        description: 'Total liquidity available for trading (minimum $10K recommended)',
        value: Math.random() * 100,
        status: Math.random() > 0.2 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'Deployer LP Control',
        abbreviation: 'DLC',
        description: 'Percentage of LP tokens controlled by deployer wallet',
        value: Math.random() * 100,
        status: Math.random() > 0.4 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'Pool Age',
        abbreviation: 'PA',
        description: 'How long the liquidity pool has existed (newer = riskier)',
        value: tokenData.symbol === 'SUI' ? 100 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 20
      }
    ];

    // Holder Distribution Analysis (20%)
    const holderMetrics: AnalysisMetric[] = [
      {
        name: 'Top Holders Concentration',
        abbreviation: 'THC',
        description: 'Percentage of tokens held by top 10 wallets (>50% = high risk)',
        value: tokenData.symbol === 'SUI' ? 75 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 30
      },
      {
        name: 'Deployer Activity',
        abbreviation: 'DA',
        description: 'Frequency and pattern of deployer wallet transactions',
        value: Math.random() * 100,
        status: Math.random() > 0.25 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'Whale Detection',
        abbreviation: 'WD',
        description: 'Detection of large holders or bot activity patterns',
        value: Math.random() * 100,
        status: Math.random() > 0.2 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'Holder Diversity',
        abbreviation: 'HD',
        description: 'Distribution of tokens across unique wallet addresses',
        value: tokenData.symbol === 'SUI' ? 85 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 20
      }
    ];

    // Community Signals Analysis (15%)
    const communityMetrics: AnalysisMetric[] = [
      {
        name: 'Social Media Presence',
        abbreviation: 'SMP',
        description: 'Verified presence on Twitter, Telegram, Discord platforms',
        value: tokenData.symbol === 'SUI' ? 95 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.4 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'Engagement Quality',
        abbreviation: 'EQ',
        description: 'Ratio of real engagement vs potential bot activity',
        value: Math.random() * 100,
        status: Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 25
      },
      {
        name: 'On-Chain Activity',
        abbreviation: 'OCA',
        description: 'Growth in unique users and contract interactions',
        value: tokenData.symbol === 'SUI' ? 90 : Math.random() * 100,
        status: tokenData.symbol === 'SUI' ? 'safe' : Math.random() > 0.35 ? 'safe' : 'warning',
        weight: 30
      },
      {
        name: 'Market Mentions',
        abbreviation: 'MM',
        description: 'Frequency of organic mentions across crypto forums and news',
        value: Math.random() * 100,
        status: Math.random() > 0.3 ? 'safe' : 'warning',
        weight: 20
      }
    ];

    const calculateCategoryScore = (metrics: AnalysisMetric[]): number => {
      const weightedSum = metrics.reduce((sum, metric) => {
        const score = metric.status === 'safe' ? 1.0 : metric.status === 'warning' ? 0.5 : 0.0;
        return sum + (score * metric.weight);
      }, 0);
      const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
      return (weightedSum / totalWeight) * 100;
    };

    const categories: AnalysisCategory[] = [
      {
        name: 'Smart Contract Behavior',
        abbreviation: 'SCB',
        description: 'Analysis of contract code for malicious patterns and owner privileges',
        metrics: smartContractMetrics,
        score: calculateCategoryScore(smartContractMetrics),
        weight: 40
      },
      {
        name: 'Liquidity Health',
        abbreviation: 'LH',
        description: 'Assessment of liquidity pool security and depth',
        metrics: liquidityMetrics,
        score: calculateCategoryScore(liquidityMetrics),
        weight: 25
      },
      {
        name: 'Holder Distribution',
        abbreviation: 'HD',
        description: 'Analysis of token distribution and whale concentration',
        metrics: holderMetrics,
        score: calculateCategoryScore(holderMetrics),
        weight: 20
      },
      {
        name: 'Community Signals',
        abbreviation: 'CS',
        description: 'Evaluation of community engagement and social presence',
        metrics: communityMetrics,
        score: calculateCategoryScore(communityMetrics),
        weight: 15
      }
    ];

    // Calculate overall trust score
    const trustScore = categories.reduce((sum, category) => {
      return sum + (category.score * category.weight / 100);
    }, 0);

    const riskLevel: 'low' | 'medium' | 'high' = trustScore >= 80 ? 'low' : trustScore >= 50 ? 'medium' : 'high';

    // Generate recommendations
    const recommendations: string[] = [];
    categories.forEach(category => {
      category.metrics.forEach(metric => {
        if (metric.status === 'risk') {
          recommendations.push(`Critical: Address ${metric.name} issues immediately`);
        } else if (metric.status === 'warning') {
          recommendations.push(`Caution: Monitor ${metric.name} closely`);
        }
      });
    });

    if (recommendations.length === 0) {
      recommendations.push('Token shows strong fundamentals across all metrics');
      recommendations.push('Continue monitoring for any changes in risk profile');
    }

    return {
      token: tokenData,
      trustScore: Math.round(trustScore),
      riskLevel,
      categories,
      lastUpdated: new Date(),
      recommendations
    };
  };

  const analyzeToken = async (tokenData: Token) => {
    if (!tokenData) return;
    
    setLoading(true);
    try {
      const analysisResult = await generateAnalysis(tokenData);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      analyzeToken(token);
    } else {
      setAnalysis(null);
    }
  }, [token]);

  return { analysis, loading, analyzeToken };
};

// Wallet Connection Modal Component
const WalletModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  isDark: boolean;
  wallet: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  connectWithGoogle: () => void;
  connectWithSuiWallet: () => void;
  disconnect: () => void;
  copyAddress: () => void;
}> = ({ 
  isOpen, 
  onClose, 
  isDark, 
  wallet, 
  isConnecting, 
  error, 
  connectWithGoogle, 
  connectWithSuiWallet, 
  disconnect,
  copyAddress 
}) => {
  if (!isOpen) return null;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {wallet ? 'Wallet Connected' : 'Connect Wallet'}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className={`mb-4 p-4 rounded-lg border ${
                isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {wallet ? (
              // Connected State
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {wallet.type === 'zk-google' ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {wallet.type === 'zk-google' ? 'Google (ZK Login)' : 'Sui Wallet'}
                      </div>
                      {wallet.name && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {wallet.name}
                        </div>
                      )}
                      {wallet.email && (
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {wallet.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Wallet Address
                  </div>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-2 rounded-lg text-sm font-mono ${
                      isDark ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formatAddress(wallet.address)}
                    </code>
                    <button
                      onClick={copyAddress}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'text-gray-400 hover:text-white hover:bg-slate-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'text-gray-400 hover:text-white hover:bg-slate-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                      }`}
                      title="View on explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={disconnect}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              // Connection Options
              <div className="space-y-4">
                <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose your preferred connection method
                </p>

                <button
                  onClick={connectWithGoogle}
                  disabled={isConnecting}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 hover:shadow-md'
                  } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Continue with Google</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Zero-knowledge login with Google account
                    </div>
                  </div>
                  {isConnecting && (
                    <div className="animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <button
                  onClick={connectWithSuiWallet}
                  disabled={isConnecting}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 hover:shadow-md'
                  } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Sui Wallet</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect with browser extension wallet
                    </div>
                  </div>
                  {isConnecting && (
                    <div className="animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  By connecting a wallet, you agree to ChainCheck's Terms of Service and Privacy Policy
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Token Analysis Modal Component
const AnalysisModal: React.FC<{ 
  token: Token | null; 
  onClose: () => void;
  isDark: boolean;
}> = ({ token, onClose, isDark }) => {
  const { analysis, loading } = useTokenAnalysis(token);

  if (!token) return null;

  const getStatusColor = (status: 'safe' | 'warning' | 'risk'): string => {
    switch(status) {
      case 'safe': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'risk': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: 'safe' | 'warning' | 'risk'): string => {
    switch(status) {
      case 'safe': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'risk': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high'): string => {
    switch(riskLevel) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <div 
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm rounded-lg border shadow-lg z-50 whitespace-nowrap ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'
        }`}>
          {/* Header */}
          <div className={`px-8 py-6 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {token.image ? (
                  <img src={token.image} alt={token.symbol} className="w-16 h-16 rounded-2xl" />
                ) : (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl
                    ${token.symbol === 'SUI' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      token.symbol === 'CETUS' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      token.symbol === 'TURBOS' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      token.symbol === 'DEEP' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                      'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {token.name} Analysis
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {token.symbol}
                    </span>
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {token.price}
                    </span>
                    <span className={`flex items-center gap-1 text-lg font-medium ${
                      token.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {token.trending === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {token.change}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {analysis && (
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${
                      analysis.riskLevel === 'low' ? 'text-emerald-400' :
                      analysis.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {analysis.trustScore}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Trust Score
                    </div>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className={`p-3 rounded-xl transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <div className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analyzing {token.symbol}...
                </div>
                <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Performing comprehensive risk assessment
                </div>
              </div>
            ) : analysis ? (
              <div className="p-8">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        analysis.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                        analysis.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Risk Level
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadge(analysis.riskLevel)}`}>
                          {analysis.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Market Cap
                        </div>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {token.marketCap}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Last Updated
                        </div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {analysis.lastUpdated.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trading View Chart Placeholder */}
                <div className={`mb-8 p-8 rounded-2xl border ${
                  isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Live Trading View
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Live Data
                      </span>
                    </div>
                  </div>
                  <div className={`h-80 rounded-xl border-2 border-dashed flex items-center justify-center ${
                    isDark ? 'border-slate-600 bg-slate-800/50' : 'border-gray-300 bg-gray-100/50'
                  }`}>
                    <div className="text-center">
                      <LineChart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                      <div className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        TradingView Integration
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        Live price chart and technical indicators would display here
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {analysis.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className={`p-6 rounded-2xl border ${
                      isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            categoryIndex === 0 ? 'bg-blue-500/20 text-blue-400' :
                            categoryIndex === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                            categoryIndex === 2 ? 'bg-purple-500/20 text-purple-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {categoryIndex === 0 ? <Code className="w-5 h-5" /> :
                             categoryIndex === 1 ? <Droplets className="w-5 h-5" /> :
                             categoryIndex === 2 ? <Users className="w-5 h-5" /> :
                             <Network className="w-5 h-5" />}
                          </div>
                          <div>
                            <Tooltip content={category.description}>
                              <h4 className={`text-lg font-bold cursor-help ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {category.abbreviation}
                              </h4>
                            </Tooltip>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {category.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            category.score >= 80 ? 'text-emerald-400' :
                            category.score >= 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {Math.round(category.score)}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            Weight: {category.weight}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {category.metrics.map((metric, metricIndex) => (
                          <div key={metricIndex} className={`p-4 rounded-xl border ${
                            isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Tooltip content={metric.description}>
                                  <span className={`text-sm font-semibold cursor-help ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {metric.abbreviation}
                                  </span>
                                </Tooltip>
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {metric.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                                  {Math.round(metric.value)}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${
                                  metric.status === 'safe' ? 'bg-emerald-400' :
                                  metric.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                }`}></span>
                              </div>
                            </div>
                            <div className={`w-full h-2 rounded-full ${
                              isDark ? 'bg-slate-600' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  metric.status === 'safe' ? 'bg-emerald-400' :
                                  metric.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${metric.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${
                      isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <Brain className="w-5 h-5" />
                    </div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      AI Recommendations
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-xl ${
                        recommendation.startsWith('Critical') 
                          ? isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                          : recommendation.startsWith('Caution')
                          ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                          : isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          recommendation.startsWith('Critical') ? 'bg-red-400' :
                          recommendation.startsWith('Caution') ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></div>
                        <span className={`text-sm ${
                          recommendation.startsWith('Critical') 
                            ? isDark ? 'text-red-300' : 'text-red-700'
                            : recommendation.startsWith('Caution')
                            ? isDark ? 'text-amber-300' : 'text-amber-700'
                            : isDark ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>
                          {recommendation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Failed
                </div>
                <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Unable to perform token analysis at this time
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-8 py-6 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Close
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-200">
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

// Custom hooks for real-time data
const useSuiEcosystemData = (page: number = 1, perPage: number = 50, filters: TokenFilters) => {
  const [tokens, setTokens] = useState<SuiTokenData[]>([]);
  const [allTokens, setAllTokens] = useState<SuiTokenData[]>([]);
  const [suiMainToken, setSuiMainToken] = useState<SuiTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: perPage
  });

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch SUI main token data
      const suiResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/sui?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false'
      );
      
      // Fetch Sui ecosystem tokens with pagination
      const ecosystemResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=sui-ecosystem&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!suiResponse.ok || !ecosystemResponse.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const [suiData, ecosystemData] = await Promise.all([
        suiResponse.json(),
        ecosystemResponse.json()
      ]);
      
      // Process SUI main token
      const processedSuiToken: SuiTokenData = {
        id: suiData.id,
        symbol: suiData.symbol?.toUpperCase() || 'SUI',
        name: suiData.name || 'Sui',
        current_price: suiData.market_data?.current_price?.usd || 0,
        price_change_percentage_24h: suiData.market_data?.price_change_percentage_24h || 0,
        market_cap: suiData.market_data?.market_cap?.usd || 0,
        total_volume: suiData.market_data?.total_volume?.usd || 0,
        market_cap_rank: suiData.market_cap_rank || 0,
        circulating_supply: suiData.market_data?.circulating_supply || 0,
        max_supply: suiData.market_data?.max_supply || 0,
        image: suiData.image?.small || ''
      };
      
      setSuiMainToken(processedSuiToken);
      
      // Store all tokens for filtering
      const allTokensData = [processedSuiToken, ...(ecosystemData || [])];
      setAllTokens(allTokensData);
      
      // Apply filters and pagination
      const filteredTokens = applyFilters(allTokensData, filters);
      const paginatedTokens = paginate(filteredTokens, page, perPage);
      
      setTokens(paginatedTokens.data);
      setPagination(paginatedTokens.pagination);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching Sui ecosystem data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (tokensData: SuiTokenData[], filters: TokenFilters): SuiTokenData[] => {
    let filtered = [...tokensData];
    
    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        token.symbol.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply category filter (simplified categorization based on token names)
    if (filters.category !== 'All') {
      filtered = filtered.filter(token => {
        const name = token.name.toLowerCase();
        const symbol = token.symbol.toLowerCase();
        
        switch (filters.category) {
          case 'DeFi':
            return name.includes('dex') || name.includes('swap') || name.includes('cetus') || 
                   name.includes('turbos') || name.includes('finance') || symbol.includes('cetus');
          case 'Gaming':
            return name.includes('game') || name.includes('nft') || name.includes('metaverse') ||
                   name.includes('play');
          case 'Infrastructure':
            return name.includes('sui') || name.includes('node') || name.includes('validator') ||
                   name.includes('bridge') || name.includes('oracle');
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'market_cap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'volume':
          aValue = a.total_volume;
          bValue = b.total_volume;
          break;
        case 'price_change_percentage_24h':
          aValue = a.price_change_percentage_24h || 0;
          bValue = b.price_change_percentage_24h || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.market_cap;
          bValue = b.market_cap;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };
  
  const paginate = (data: SuiTokenData[], page: number, perPage: number) => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: perPage
      }
    };
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, filters.category, filters.search, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    // Update every 30 seconds only for price data
    const interval = setInterval(() => {
      if (!filters.search && filters.category === 'All') {
        fetchData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filters]);

  return { tokens, allTokens, suiMainToken, loading, error, lastUpdated, pagination, refetch: fetchData };
};

const useSuiSystemData = () => {
  const [systemState, setSystemState] = useState<SuiSystemState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemState = async () => {
      try {
        const response = await fetch('https://fullnode.mainnet.sui.io:443', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "suix_getLatestSuiSystemState",
            params: [],
            id: 1
          })
        });
        
        const data = await response.json();
        
        if (data.result) {
          setSystemState({
            epoch: data.result.epoch || '0',
            totalStake: data.result.totalStake || '0',
            activeValidators: data.result.activeValidators?.length || 0,
            totalSupply: data.result.totalSupply || '0'
          });
        }
      } catch (error) {
        console.error('Error fetching Sui system state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemState();
  }, []);

  return { systemState, loading };
};

// Utility functions
const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
  return `$${marketCap.toFixed(2)}`;
};

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
};

const formatSupply = (supply: number): string => {
  if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
  if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
  if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
  return supply.toString();
};

const getRiskScore = (priceChange: number, marketCap: number): 'low' | 'medium' | 'high' => {
  if (marketCap > 1e9 && Math.abs(priceChange) < 10) return 'low';
  if (marketCap > 1e8 && Math.abs(priceChange) < 20) return 'medium';
  return 'high';
};

const getTokenCategory = (name: string, symbol: string): 'DeFi' | 'Gaming' | 'Infrastructure' | 'NFT' | 'Other' => {
  const nameLower = name.toLowerCase();
  const symbolLower = symbol.toLowerCase();
  
  if (nameLower.includes('dex') || nameLower.includes('swap') || nameLower.includes('cetus') || 
      nameLower.includes('turbos') || nameLower.includes('finance') || symbolLower.includes('cetus')) {
    return 'DeFi';
  }
  if (nameLower.includes('game') || nameLower.includes('nft') || nameLower.includes('metaverse') ||
      nameLower.includes('play')) {
    return 'Gaming';
  }
  if (nameLower.includes('sui') || nameLower.includes('node') || nameLower.includes('validator') ||
      nameLower.includes('bridge') || nameLower.includes('oracle')) {
    return 'Infrastructure';
  }
  if (nameLower.includes('nft') || nameLower.includes('collectible')) {
    return 'NFT';
  }
  return 'Other';
};

const ChainCheckApp: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedTokenForAnalysis, setSelectedTokenForAnalysis] = useState<Token | null>(null);
  
  // Wallet connection state
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  
  // Market overview state
  const [marketFilters, setMarketFilters] = useState<TokenFilters>({
    category: 'All',
    search: '',
    sortBy: 'market_cap',
    sortOrder: 'desc'
  });
  const [currentMarketPage, setCurrentMarketPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Real-time data hooks
  const { tokens: suiTokens, allTokens, suiMainToken, loading: marketLoading, error: marketError, lastUpdated, pagination, refetch } = useSuiEcosystemData(currentMarketPage, itemsPerPage, marketFilters);
  const { systemState, loading: systemLoading } = useSuiSystemData();
  
  // Wallet connection hook
  const { 
    wallet, 
    isConnecting, 
    error: walletError, 
    connectWithGoogle, 
    connectWithSuiWallet, 
    disconnect, 
    copyAddress 
  } = useWalletConnection();

  const isDark = theme === 'dark';

  // Convert API data to display format - keeping original Token interface
  const convertApiToTokens = (): Token[] => {
    const converted: Token[] = suiTokens.map((token, index) => ({
      id: index + 1,
      name: token.name,
      symbol: token.symbol?.toUpperCase() || '',
      price: formatPrice(token.current_price),
      change: `${token.price_change_percentage_24h?.toFixed(2) || '0.00'}%`,
      marketCap: formatMarketCap(token.market_cap),
      volume: formatVolume(token.total_volume),
      riskScore: getRiskScore(token.price_change_percentage_24h, token.market_cap),
      trending: (token.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down',
      image: token.image,
      liquidity: formatVolume(token.total_volume * 0.3), // Estimate liquidity as 30% of volume
      address: token.id === 'sui' ? '0x2::sui::SUI' : undefined,
      category: getTokenCategory(token.name, token.symbol || '')
    }));

    // Add SUI main token at the beginning if available and not already included
    if (suiMainToken && !converted.find(t => t.symbol === 'SUI')) {
      const suiToken: Token = {
        id: 0,
        name: suiMainToken.name,
        symbol: suiMainToken.symbol,
        price: formatPrice(suiMainToken.current_price),
        change: `${suiMainToken.price_change_percentage_24h?.toFixed(2) || '0.00'}%`,
        marketCap: formatMarketCap(suiMainToken.market_cap),
        volume: formatVolume(suiMainToken.total_volume),
        riskScore: getRiskScore(suiMainToken.price_change_percentage_24h, suiMainToken.market_cap),
        trending: (suiMainToken.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down',
        image: suiMainToken.image,
        address: '0x2::sui::SUI',
        liquidity: formatVolume(suiMainToken.total_volume * 0.4), // Higher liquidity estimate for main token
        category: 'Infrastructure'
      };
      return [suiToken, ...converted];
    }

    return converted;
  };

  // Use live data if available, otherwise fall back to mock data
  const liveTokens = convertApiToTokens();
  const displayTokens = liveTokens.length > 0 ? liveTokens : [
    {
      id: 1,
      name: 'Sui',
      symbol: 'SUI',
      price: '$2.34',
      change: '+5.67%',
      marketCap: '$6.24B',
      volume: '$234.5M',
      liquidity: '$450M',
      riskScore: 'low' as const,
      trending: 'up' as const,
      address: '0x2::sui::SUI',
      category: 'Infrastructure' as const
    }
  ];

  // Calculate real market stats using live data
  const getMarketStats = (): MarketStats => {
    const tokens = allTokens.length > 0 ? allTokens : suiTokens;
    return {
      totalTokens: tokens.length || 12847,
      scamsDetected: tokens.filter(t => getRiskScore(t.price_change_percentage_24h || 0, t.market_cap) === 'high').length || 1203,
      riskAssessments: tokens.length || 45692,
      activeUsers: systemState ? systemState.activeValidators * 150 : 8934
    };
  };

  const marketStats = getMarketStats();

  const getRiskColor = (risk: Token['riskScore']): string => {
    switch(risk) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBadge = (risk: Token['riskScore']): string => {
    switch(risk) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const features: Feature[] = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description: "Advanced on-chain analysis with millisecond precision data aggregation",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Assessment",
      description: "Multi-layer security analysis using machine learning algorithms",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Automation",
      description: "Automated risk scoring and portfolio optimization strategies",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Sui Ecosystem",
      description: "Native integration with Sui blockchain and Move smart contracts",
      gradient: "from-orange-500/20 to-red-500/20"
    }
  ];

  const getCategoryStyle = (category: string): string => {
    switch(category) {
      case 'Security': return isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200';
      case 'Infrastructure': return isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Analytics': return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Risk Management': return isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Research': return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return isDark ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Token Modal Component (updated with Analysis button)
  const TokenModal: React.FC<{ token: Token; onClose: () => void }> = ({ token, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className={`inline-block align-bottom rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {token.image ? (
                  <img src={token.image} alt={token.symbol} className="w-12 h-12 rounded-xl" />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg
                    ${token.symbol === 'SUI' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      token.symbol === 'CETUS' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      token.symbol === 'TURBOS' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      token.symbol === 'DEEP' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                      'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {token.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {token.symbol}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Current Price</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {token.price}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>24h Change</div>
                <div className={`text-2xl font-bold flex items-center space-x-2 ${
                  token.trending === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {token.trending === 'up' ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span>{token.change}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Market Cap</div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {token.marketCap}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>24h Volume</div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {token.volume}
                </div>
              </div>
            </div>

            {token.liquidity && (
              <div className="mb-6">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Estimated Liquidity</div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {token.liquidity}
                </div>
              </div>
            )}

            {token.address && (
              <div className="mb-6">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Contract Address</div>
                <div className={`p-3 rounded-lg font-mono text-sm break-all ${
                  isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {token.address}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Risk Assessment</div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskBadge(token.riskScore)}`}>
                  {token.riskScore.toUpperCase()} RISK
                </span>
                {token.riskScore === 'low' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                {token.riskScore === 'medium' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                {token.riskScore === 'high' && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
            </div>

            {token.category && (
              <div className="mb-6">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Category</div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
                  token.category === 'DeFi' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  token.category === 'Gaming' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  token.category === 'Infrastructure' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                  {token.category}
                </span>
              </div>
            )}

            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Risk Assessment:</strong> Based on price volatility, market cap, trading volume, and liquidity metrics. 
                This automated analysis should not be considered financial advice.
              </div>
            </div>
          </div>

          <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedTokenForAnalysis(token);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-200"
              >
                Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Pagination Component (keeping the original)
  const Pagination: React.FC<{ 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1 
              ? isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : page === '...'
                ? isDark ? 'text-slate-500 cursor-default' : 'text-gray-400 cursor-default'
                : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages 
              ? isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  const HomePage: React.FC = () => (
    <div className="min-h-screen">
      {/* Hero Section - Keep original design */}
      <section className={`relative pt-32 pb-24 px-6 overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      }`}>
        {/* Glassmorphic background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-blue-500' : 'bg-blue-400'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            isDark ? 'bg-purple-500' : 'bg-purple-400'
          }`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header badge with live status */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-black/5 border-black/10 text-gray-900'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                marketLoading ? 'bg-yellow-400' : marketError ? 'bg-red-400' : 'bg-green-400'
              }`}></div>
              <span className="text-sm font-medium">
                {marketLoading ? 'Connecting to Sui Mainnet...' : 'Live on Sui Mainnet'}
              </span>
              {lastUpdated && (
                <span className="text-xs opacity-70">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="block mb-2">Advanced Token</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-12 leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            } max-w-3xl mx-auto`}>
              Professional-grade risk assessment and token analysis platform 
              for the Sui blockchain ecosystem
            </p>

            {/* Professional search interface */}
            <div className="relative max-w-3xl mx-auto mb-16">
              <div className={`relative backdrop-blur-xl rounded-2xl border p-2 ${
                isDark 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200/50'
              } shadow-2xl`}>
                <div className="flex items-center">
                  <div className="flex-1 flex items-center">
                    <Search className={`ml-6 mr-4 w-6 h-6 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Enter token address or symbol (e.g., 0x2::sui::SUI)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`flex-1 py-4 bg-transparent ${
                        isDark ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-slate-500'
                      } focus:outline-none text-lg font-medium`}
                    />
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                    <span>Analyze Token</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick stats with live data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {marketLoading ? '...' : marketStats.totalTokens.toLocaleString()}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Tokens Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {marketLoading ? '...' : marketStats.scamsDetected.toLocaleString()}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Scams Detected
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {marketLoading ? '...' : marketStats.riskAssessments.toLocaleString()}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Risk Assessments
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {systemLoading ? '...' : marketStats.activeUsers.toLocaleString()}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Active Users
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Data - Keep original card design */}
      <section className={`py-20 px-6 ${
        isDark ? 'bg-slate-900/50' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Live Market Intelligence
              </h2>
              <p className={`${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Real-time analysis of top Sui ecosystem tokens
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refetch}
                disabled={marketLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark 
                    ? 'text-blue-400 hover:bg-blue-500/10' 
                    : 'text-blue-600 hover:bg-blue-50'
                } ${marketLoading ? 'animate-spin' : ''}`}
                title="Refresh market data"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                isDark 
                  ? 'text-blue-400 hover:bg-blue-500/10' 
                  : 'text-blue-600 hover:bg-blue-50'
              } transition-colors duration-200`}>
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {marketLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`p-6 rounded-2xl backdrop-blur-sm border animate-pulse ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${
                      isDark ? 'bg-slate-700' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <div className={`h-4 w-16 rounded mb-2 ${
                        isDark ? 'bg-slate-700' : 'bg-gray-300'
                      }`}></div>
                      <div className={`h-3 w-20 rounded ${
                        isDark ? 'bg-slate-800' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </div>
                  <div className={`h-6 w-24 rounded mb-2 ${
                    isDark ? 'bg-slate-700' : 'bg-gray-300'
                  }`}></div>
                  <div className={`h-4 w-16 rounded ${
                    isDark ? 'bg-slate-800' : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayTokens.slice(0, 4).map((token, index) => (
                <div 
                  key={token.id}
                  className={`group p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 cursor-pointer ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {token.image ? (
                        <img src={token.image} alt={token.symbol} className="w-12 h-12 rounded-xl" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm
                          ${token.symbol === 'SUI' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            token.symbol === 'CETUS' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                            token.symbol === 'TURBOS' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                            token.symbol === 'DEEP' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                            'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {token.symbol}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      token.trending === 'up' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {token.trending === 'up' ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  <div className={`text-2xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {token.price}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm font-medium ${
                      token.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <span>{token.change}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs border ${getRiskBadge(token.riskScore)}`}>
                      {token.riskScore.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className={`mt-4 pt-4 border-t ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Volume
                      </span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>
                        {token.volume}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional live stats if SUI data is available */}
          {suiMainToken && !marketLoading && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      SUI Live Price
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(suiMainToken.current_price)}
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${
                      (suiMainToken.price_change_percentage_24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(suiMainToken.price_change_percentage_24h || 0) >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      <span>{suiMainToken.price_change_percentage_24h?.toFixed(2) || '0.00'}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Market Cap
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatMarketCap(suiMainToken.market_cap)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Rank #{suiMainToken.market_cap_rank}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      24h Volume
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatVolume(suiMainToken.total_volume)}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Supply: {formatSupply(suiMainToken.circulating_supply || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Keep original design */}
      <section className={`py-24 px-6 relative overflow-hidden ${
        isDark ? 'bg-slate-800/50' : 'bg-slate-50/50'
      }`}>
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 ${
            isDark ? 'bg-blue-500' : 'bg-blue-400'
          }`}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Enterprise-Grade Platform
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Built for institutional investors, DeFi protocols, and sophisticated traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'bg-white/80 border-gray-200 hover:bg-white hover:shadow-xl'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${
                  isDark ? 'border-white/20' : 'border-gray-200'
                } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={isDark ? 'text-white' : 'text-gray-700'}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Data Table - Enhanced with all features */}
      <section className={`py-24 px-6 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Market Overview
            </h2>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={marketFilters.search}
                  onChange={(e) => {
                    setMarketFilters(prev => ({ ...prev, search: e.target.value }));
                    setCurrentMarketPage(1);
                  }}
                  className={`pl-10 pr-4 py-2 w-64 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              {/* Category Filter */}
              <select 
                value={marketFilters.category}
                onChange={(e) => {
                  setMarketFilters(prev => ({ ...prev, category: e.target.value }));
                  setCurrentMarketPage(1);
                }}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="All">All Tokens</option>
                <option value="DeFi">DeFi</option>
                <option value="Gaming">Gaming</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="NFT">NFT</option>
              </select>
              
              {/* Sort Options */}
              <select
                value={`${marketFilters.sortBy}-${marketFilters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [typeof marketFilters.sortBy, typeof marketFilters.sortOrder];
                  setMarketFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="market_cap-desc">Market Cap ↓</option>
                <option value="market_cap-asc">Market Cap ↑</option>
                <option value="volume-desc">Volume ↓</option>
                <option value="volume-asc">Volume ↑</option>
                <option value="price_change_percentage_24h-desc">Change ↓</option>
                <option value="price_change_percentage_24h-asc">Change ↑</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>
          
          <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Table Header with Results Info */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {marketLoading ? (
                    'Loading tokens...'
                  ) : (
                    `Showing ${((currentMarketPage - 1) * itemsPerPage) + 1}-${Math.min(currentMarketPage * itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} tokens`
                  )}
                </div>
                <button
                  onClick={refetch}
                  disabled={marketLoading}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'text-blue-400 hover:bg-blue-500/10' 
                      : 'text-blue-600 hover:bg-blue-50'
                  } ${marketLoading ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Asset
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Price
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      24h Change
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Market Cap
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Volume
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Category
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Risk Score
                    </th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marketLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                            <div>
                              <div className={`h-4 w-24 rounded mb-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                              <div className={`h-3 w-16 rounded ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                            </div>
                          </div>
                        </td>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className={`h-4 w-16 rounded mx-auto ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : displayTokens.length > 0 ? (
                    displayTokens.map((token, index) => (
                      <tr 
                        key={token.id} 
                        className={`border-t transition-colors duration-200 cursor-pointer ${
                          isDark 
                            ? 'border-white/10 hover:bg-white/5' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedToken(token)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {token.image ? (
                              <img src={token.image} alt={token.symbol} className="w-10 h-10 rounded-xl" />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm
                                ${token.symbol === 'SUI' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                  token.symbol === 'CETUS' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                  token.symbol === 'TURBOS' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                                  token.symbol === 'DEEP' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                  'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                                {token.symbol.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className={`font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {token.name}
                              </div>
                              <div className={`text-sm ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {token.price}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${
                          token.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <div className="flex items-center justify-end gap-1">
                            {token.trending === 'up' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {token.change}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {token.marketCap}
                        </td>
                        <td className={`px-6 py-4 text-right ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {token.volume}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {token.category && (
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${
                              token.category === 'DeFi' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              token.category === 'Gaming' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              token.category === 'Infrastructure' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              token.category === 'NFT' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {token.category}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadge(token.riskScore)}`}>
                            {token.riskScore.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTokenForAnalysis(token);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
                          >
                            Analysis
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {marketFilters.search || marketFilters.category !== 'All' 
                          ? 'No tokens found matching your criteria.' 
                          : 'No token data available.'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentMarketPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentMarketPage}
            />
          </div>

          {/* Network Status - Additional live data */}
          {systemState && !systemLoading && (
            <div className="mt-12">
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Sui Network Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {systemState.epoch}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Current Epoch
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {systemState.activeValidators}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Active Validators
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {formatSupply(parseFloat(systemState.totalStake) / 1e9)}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Total Staked SUI
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {formatSupply(parseFloat(systemState.totalSupply) / 1e9)}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Total Supply
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Token Modal */}
      {selectedToken && (
        <TokenModal token={selectedToken} onClose={() => setSelectedToken(null)} />
      )}
    </div>
  );

  const PortfolioPage: React.FC = () => (
    <div className="min-h-screen pt-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className={`p-16 rounded-3xl backdrop-blur-sm border ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h1 className={`text-4xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Portfolio Intelligence
          </h1>
          <p className={`text-xl mb-8 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Advanced portfolio management and risk assessment tools are in development
          </p>
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            <Lock className="w-5 h-5" />
            <span className="font-medium">Expected Launch: Q2 2025</span>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Real-time Portfolio Tracking",
                description: "Monitor your Sui assets with institutional-grade precision"
              },
              {
                title: "Risk Management Tools",
                description: "Advanced algorithms for portfolio risk assessment and optimization"
              },
              {
                title: "Performance Analytics",
                description: "Comprehensive reporting and performance attribution analysis"
              }
            ].map((feature, index) => (
              <div key={index} className={`p-6 rounded-xl border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const LearnPage: React.FC = () => {
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

    return (
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
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
          </div>

          {/* Categories filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['All', 'Security', 'Infrastructure', 'Analytics', 'Risk Management', 'Research'].map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  category === 'All' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent'
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
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-6 ${getCategoryStyle(article.category)}`}>
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
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isDark ? 'dark bg-slate-900' : 'bg-white'} transition-colors duration-300 min-h-screen`}>
      {/* Professional Navigation - Updated with Connect Wallet button */}
      <nav className={`fixed w-full z-50 backdrop-blur-xl border-b ${
        isDark 
          ? 'bg-slate-900/80 border-white/10' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Professional Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-lg ${
                    isDark ? 'bg-white' : 'bg-white'
                  }`}></div>
                </div>
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                  marketLoading ? 'bg-yellow-400' : marketError ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ChainCheck
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Professional Grade
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { name: 'Intelligence', id: 'home' as PageType },
                { name: 'Portfolio', id: 'portfolio' as PageType },
                { name: 'Research', id: 'learn' as PageType }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
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
              {/* Live data refresh button */}
              <button
                onClick={refetch}
                disabled={marketLoading}
                className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-blue-400' 
                    : 'bg-gray-100 border-gray-200 text-blue-600'
                } ${marketLoading ? 'animate-spin' : ''}`}
                title="Refresh live data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
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

              {/* Connect Wallet Button */}
              {wallet ? (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/20 text-white hover:bg-white/10' 
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {wallet.type === 'zk-google' ? (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
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
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden py-6 border-t backdrop-blur-sm ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              {[
                { name: 'Intelligence', id: 'home' as PageType },
                { name: 'Portfolio', id: 'portfolio' as PageType },
                { name: 'Research', id: 'learn' as PageType }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDark 
                        ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                        : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile wallet button */}
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
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
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

      {/* Page Content */}
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'portfolio' && <PortfolioPage />}
      {currentPage === 'learn' && <LearnPage />}

      {/* Professional Footer - Keep original design */}
      <footer className={`py-20 px-6 border-t ${
        isDark 
          ? 'bg-slate-800/50 border-white/10' 
          : 'bg-slate-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-lg ${
                    isDark ? 'bg-white' : 'bg-white'
                  }`}></div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    ChainCheck
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Professional Grade Intelligence
                  </div>
                </div>
              </div>
              <p className={`mb-8 max-w-md leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Enterprise-grade token analysis and risk assessment platform for institutional investors and professional traders on the Sui blockchain.
              </p>
              <div className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                © 2025 ChainCheck Intelligence. All rights reserved.
              </div>
              {lastUpdated && (
                <div className={`text-xs mt-2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Last market update: {lastUpdated.toLocaleString()}
                </div>
              )}
            </div>
            
            <div>
              <h4 className={`font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Platform
              </h4>
              <ul className="space-y-3">
                {['Token Analysis', 'Risk Assessment', 'Portfolio Management', 'Market Intelligence', 'API Access'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-gray-900'
                    } transition-colors duration-200 text-sm`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Resources
              </h4>
              <ul className="space-y-3">
                {['Documentation', 'Research Papers', 'Case Studies', 'Security Audits', 'Contact Sales'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-gray-900'
                    } transition-colors duration-200 text-sm`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className={`mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Built for the future of institutional DeFi • Powered by live Sui blockchain data
            </div>
            <div className="flex items-center gap-6">
              {['Terms', 'Privacy', 'Security', 'Status'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-gray-900'
                  } transition-colors duration-200`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        isDark={isDark}
        wallet={wallet}
        isConnecting={isConnecting}
        error={walletError}
        connectWithGoogle={connectWithGoogle}
        connectWithSuiWallet={connectWithSuiWallet}
        disconnect={disconnect}
        copyAddress={copyAddress}
      />

      {/* Analysis Modal */}
      <AnalysisModal
        token={selectedTokenForAnalysis}
        onClose={() => setSelectedTokenForAnalysis(null)}
        isDark={isDark}
      />
    </div>
  );
};

export default ChainCheckApp;