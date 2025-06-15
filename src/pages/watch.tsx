import React, { useState, useEffect } from 'react';
import { Search, Wallet, Image, TrendingUp, TrendingDown, Eye, Shield, BarChart3, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import LaunchButton from '../hooks/makePayment';
import { useSharedSession } from '../hooks/sessionTimer';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';

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
  isVerified: boolean;
  coinType: string;
}

interface NFTCollection {
  name: string;
  count: number;
  floorPrice: number;
  totalValue: number;
}

interface WalletAnalysisData {
  walletAddress: string;
  totalValueUsd: number;
  coinHoldings: CoinHolding[];
  nftCollections: NFTCollection[];
  totalTransactions: number;
  riskScore: number;
  lastActivity: number;
  analysisTimestamp: number;
  isActive: boolean;
  activityScore: number;
  diversityScore: number;
  isWhale: boolean;
}

interface WalletAnalyzerProps {
  isDark?: boolean;
}

// Sui RPC endpoints
const SUI_MAINNET_RPC = 'https://fullnode.mainnet.sui.io:443';

// Known token types on Sui
const KNOWN_TOKENS = {
  SUI: '0x2::sui::SUI',
  USDC: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  USDT: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
  WETH: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
  CETUS: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
  HASUI: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'
};

// Token metadata
const TOKEN_INFO = {
  [KNOWN_TOKENS.SUI]: { symbol: 'SUI', name: 'Sui', decimals: 9, icon: 'S' },
  [KNOWN_TOKENS.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6, icon: 'U' },
  [KNOWN_TOKENS.USDT]: { symbol: 'USDT', name: 'Tether USD', decimals: 6, icon: 'T' },
  [KNOWN_TOKENS.WETH]: { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 8, icon: 'E' },
  [KNOWN_TOKENS.CETUS]: { symbol: 'CETUS', name: 'Cetus Protocol', decimals: 9, icon: 'C' },
  [KNOWN_TOKENS.HASUI]: { symbol: 'HASUI', name: 'haSUI', decimals: 9, icon: 'H' }
};

export const WalletAnalyzer: React.FC<WalletAnalyzerProps> = ({ isDark = false }) => {
  const { isUnlocked, unlock } = useSharedSession();
  const { connected, account } = useWallet();
  const [showResults, setShowResults] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analysisData, setAnalysisData] = useState<WalletAnalysisData | null>(null);
  const [error, setError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  const [hideOptions, setHideOptions] = useState({
    verified: 0,
    unknown: 0
  });

  // Validate Sui address format
  const validateSuiAddress = (address: string): boolean => {
    const cleanAddress = address.trim();
    
    if (!cleanAddress.startsWith('0x')) {
      setValidationError('Sui address must start with 0x');
      return false;
    }
    
    if (cleanAddress.length !== 66) {
      setValidationError('Sui address must be 66 characters long (0x + 64 hex characters)');
      return false;
    }
    
    const hexPart = cleanAddress.slice(2);
    const hexRegex = /^[0-9a-fA-F]+$/;
    if (!hexRegex.test(hexPart)) {
      setValidationError('Address contains invalid characters. Only hexadecimal characters (0-9, a-f, A-F) are allowed');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  // Make RPC call to Sui
  const suiRpcCall = async (method: string, params: any[]) => {
    try {
      const response = await fetch(SUI_MAINNET_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('RPC Error:', data.error);
        throw new Error(data.error.message || 'RPC call failed');
      }

      return data.result;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  // Get all coins owned by an address
  const getOwnedCoins = async (address: string) => {
    try {
      const coins = await suiRpcCall('suix_getAllCoins', [address]);
      return coins.data || [];
    } catch (error) {
      console.error('Error fetching coins:', error);
      return [];
    }
  };

  // Get owned objects (for NFTs)
  const getOwnedObjects = async (address: string) => {
    try {
      const objects = await suiRpcCall('suix_getOwnedObjects', [
        address,
        {
          filter: null,
          options: {
            showType: true,
            showOwner: true,
            showDisplay: true,
          }
        }
      ]);
      return objects.data || [];
    } catch (error) {
      console.error('Error fetching objects:', error);
      return [];
    }
  };

  // Get transaction count
  const getTransactionCount = async (address: string) => {
    try {
      // Get recent transactions to estimate total count
      const txns = await suiRpcCall('suix_queryTransactionBlocks', [
        {
          filter: {
            FromAddress: address
          },
          options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: false
          }
        },
        null,
        50,
        false
      ]);
      
      // This is an approximation since full history requires pagination
      return txns.data ? txns.data.length : 0;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return 0;
    }
  };

  // Fetch current prices from CoinGecko or similar
  const fetchTokenPrices = async () => {
    // In a real implementation, you'd fetch from CoinGecko API
    // For now, returning static prices
    return {
      'sui': { usd: 3.16, usd_24h_change: 2.5 },
      'usd-coin': { usd: 1.00, usd_24h_change: 0.01 },
      'tether': { usd: 1.00, usd_24h_change: -0.01 },
      'ethereum': { usd: 2456.78, usd_24h_change: -1.2 },
      'cetus-protocol': { usd: 0.15, usd_24h_change: 5.3 }
    };
  };

  // Process coin data into holdings
  const processCoinData = async (coins: any[], prices: any) => {
    const holdings: CoinHolding[] = [];
    const coinMap = new Map<string, number>();

    // Aggregate coins by type
    for (const coin of coins) {
      const coinType = coin.coinType;
      const balance = parseInt(coin.balance) || 0;
      
      if (coinMap.has(coinType)) {
        coinMap.set(coinType, coinMap.get(coinType)! + balance);
      } else {
        coinMap.set(coinType, balance);
      }
    }

    // Convert to holdings
    let id = 1;
    for (const [coinType, balance] of Array.from(coinMap.entries())) {
      const tokenInfo = TOKEN_INFO[coinType];
      
      if (tokenInfo) {
        const decimals = tokenInfo.decimals;
        const actualBalance = balance / Math.pow(10, decimals);
        
        // Get price data
        let price = 0;
        let priceChange = 0;
        
        switch (tokenInfo.symbol) {
          case 'SUI':
            price = prices['sui']?.usd || 3.16;
            priceChange = prices['sui']?.usd_24h_change || 0;
            break;
          case 'USDC':
            price = prices['usd-coin']?.usd || 1.00;
            priceChange = prices['usd-coin']?.usd_24h_change || 0;
            break;
          case 'USDT':
            price = prices['tether']?.usd || 1.00;
            priceChange = prices['tether']?.usd_24h_change || 0;
            break;
          case 'WETH':
            price = prices['ethereum']?.usd || 2456.78;
            priceChange = prices['ethereum']?.usd_24h_change || 0;
            break;
          case 'CETUS':
            price = prices['cetus-protocol']?.usd || 0.15;
            priceChange = prices['cetus-protocol']?.usd_24h_change || 0;
            break;
        }

        const usdValue = actualBalance * price;

        holdings.push({
          id: id.toString(),
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          price,
          priceChange,
          balance: actualBalance,
          usdValue,
          riskScore: calculateTokenRiskScore(tokenInfo.symbol),
          icon: tokenInfo.icon,
          isVerified: true,
          coinType
        });

        id++;
      } else if (balance > 0) {
        // Unknown token
        const shortType = coinType.split('::').pop() || 'Unknown';
        holdings.push({
          id: id.toString(),
          name: shortType,
          symbol: shortType,
          price: 0,
          priceChange: 0,
          balance: balance,
          usdValue: 0,
          riskScore: 9.0,
          icon: shortType.charAt(0).toUpperCase(),
          isVerified: false,
          coinType
        });
        id++;
      }
    }

    return holdings.sort((a, b) => b.usdValue - a.usdValue);
  };

  // Process NFTs
  const processNFTs = (objects: any[]) => {
    const nftMap = new Map<string, number>();
    
    // Filter out coins and system objects
    const nfts = objects.filter(obj => {
      const type = obj.data?.type || '';
      return !type.includes('::coin::Coin') && 
             !type.includes('0x2::') && 
             !type.includes('0x3::') &&
             obj.data?.display?.data;
    });

    // Group by collection (simplified - in reality you'd parse the type)
    for (const nft of nfts) {
      const type = nft.data.type;
      const collection = type.split('::')[1] || 'Unknown';
      nftMap.set(collection, (nftMap.get(collection) || 0) + 1);
    }

    const collections: NFTCollection[] = [];
    for (const [name, count] of Array.from(nftMap.entries())) {
      collections.push({
        name,
        count,
        floorPrice: 0, // Would need to fetch from marketplace APIs
        totalValue: 0
      });
    }

    return collections;
  };

  // Calculate token risk score
  const calculateTokenRiskScore = (symbol: string): number => {
    const riskScores: { [key: string]: number } = {
      'SUI': 4.2,
      'USDC': 2.1,
      'USDT': 2.3,
      'WETH': 5.1,
      'CETUS': 7.2,
      'HASUI': 3.5
    };
    return riskScores[symbol] || 8.5;
  };

  // Calculate portfolio risk score
  const calculatePortfolioRiskScore = (holdings: CoinHolding[]): number => {
    if (holdings.length === 0) return 0;
    
    const totalValue = holdings.reduce((sum, holding) => sum + holding.usdValue, 0);
    const weightedRisk = holdings.reduce((sum, holding) => {
      const weight = holding.usdValue / totalValue;
      return sum + (holding.riskScore * weight);
    }, 0);
    
    return Math.round(weightedRisk * 10) / 10;
  };

  // Main function to analyze wallet using real blockchain data
  const analyzeWalletOnChain = async (targetAddress: string): Promise<WalletAnalysisData> => {
    try {
      console.log('🔍 Fetching real blockchain data for:', targetAddress);
      
      // Fetch all data in parallel
      const [coins, objects, txCount, prices] = await Promise.all([
        getOwnedCoins(targetAddress),
        getOwnedObjects(targetAddress),
        getTransactionCount(targetAddress),
        fetchTokenPrices()
      ]);

      console.log('📊 Raw data:', { coins: coins.length, objects: objects.length, txCount });

      // Process the data
      const holdings = await processCoinData(coins, prices);
      const nftCollections = processNFTs(objects);

      // Calculate totals
      const totalValue = holdings.reduce((sum, holding) => sum + holding.usdValue, 0);
      const suiBalance = holdings.find(h => h.symbol === 'SUI')?.balance || 0;
      
      // Determine whale status and scores
      const isWhale = totalValue > 100000 || suiBalance > 10000;
      const diversityScore = (holdings.length * 15) + (nftCollections.length * 10);
      const activityScore = Math.min(999, diversityScore + Math.floor(totalValue / 1000) + (txCount * 2));

      const analysisData: WalletAnalysisData = {
        walletAddress: targetAddress,
        totalValueUsd: totalValue,
        coinHoldings: holdings,
        nftCollections,
        totalTransactions: txCount,
        riskScore: calculatePortfolioRiskScore(holdings),
        lastActivity: Date.now(), // Would need to fetch from last transaction
        analysisTimestamp: Date.now(),
        isActive: holdings.length > 0 || nftCollections.length > 0,
        activityScore,
        diversityScore,
        isWhale
      };

      console.log('✅ Analysis complete:', analysisData);
      return analysisData;
    } catch (error) {
      console.error('Error analyzing wallet:', error);
      throw new Error('Failed to analyze wallet. Please ensure the address is valid and try again.');
    }
  };

  const handleSearch = async () => {
    if (!walletAddress.trim()) {
      setValidationError('Please enter a wallet address');
      return;
    }
    
    if (!validateSuiAddress(walletAddress)) {
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      console.log('🚀 Starting search for:', walletAddress);
      const data = await analyzeWalletOnChain(walletAddress);
      setAnalysisData(data);
      
      const verified = data.coinHoldings.filter(coin => coin.isVerified).length;
      const unknown = data.coinHoldings.filter(coin => !coin.isVerified).length;
      setHideOptions({ verified, unknown });
      
      setShowResults(true);
      console.log('✅ Search completed successfully');
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the wallet');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletAddress(value);
    
    if (validationError && value.trim()) {
      setValidationError('');
    }
  };

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

  const features = [
    {
      icon: Eye,
      title: "Deep Wallet Analysis",
      description: "Comprehensive breakdown of any wallet's holdings, transaction history, and trading patterns"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Advanced algorithms evaluate portfolio risk exposure and security indicators across all assets"
    },
    {
      icon: BarChart3,
      title: "Portfolio Intelligence",
      description: "Real-time valuation, performance metrics, and detailed asset allocation insights"
    },
    {
      icon: Activity,
      title: "Behavioral Analytics",
      description: "Track trading patterns, frequency analysis, and identify sophisticated investment strategies"
    }
  ];

  // Show locked version initially
  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-20 sm:pt-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto my-4 text-center">
          <div className={`p-8 sm:p-16 rounded-3xl backdrop-blur-sm border transition-all duration-500 ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-2xl flex items-center justify-center">
              <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <h1 className={`text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Wallet Intelligence
            </h1>
            <p className={`text-base sm:text-sm mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Unlock the secrets of any blockchain wallet with institutional-grade analysis tools. 
              Get deep insights into holdings, risk profiles, and trading behaviors.
            </p>
            <div className="flex justify-center mb-8 sm:mb-16">
              <LaunchButton 
                onUnlock={unlock}
                 contractPackageId="0xf1845f05aba533e4656436af6c3622d214e7f6e0befbae14eef6d2b23462d0e6" 
                configId="0xa8464ca3ce0ddb185b6f58c497386ef826a033c718cf9c5e8ecdde517490da38"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              {features.map((feature, index) => (
                <div key={index} className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-lg'
                }`}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-4 flex items-center justify-center ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <h3 className={`font-semibold mb-3 text-base sm:text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
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
  }

  // Show input interface
  if (!showResults) {
    return (
      <div className="min-h-screen pt-20 sm:pt-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`p-8 sm:p-12 rounded-3xl backdrop-blur-sm border transition-all duration-500 ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Analyze Any Wallet
            </h1>
            <p className={`text-base sm:text-lg mb-6 sm:mb-8 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Enter a wallet address to unlock comprehensive portfolio insights and risk analysis
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={handleAddressChange}
                  placeholder="0x1234...abcd (66 characters)"
                  className={`w-full pl-4 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base transition-all duration-300 ${
                    validationError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50 focus:ring-blue-500'
                  } focus:ring-2 focus:border-transparent outline-none`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {validationError && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={!walletAddress.trim() || isSearching || !!validationError}
                className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 ${
                  !walletAddress.trim() || isSearching || !!validationError
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-90 hover:scale-105'
                }`}
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-sm text-center">
              <span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Supports Sui mainnet addresses • Real-time blockchain data
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show full wallet analysis interface after search
  if (!analysisData) return null;

  const portfolioValue = analysisData.totalValueUsd;
  const nftCount = analysisData.nftCollections.reduce((sum, collection) => sum + collection.count, 0);

  return (
    <div className="min-h-screen pt-16 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-20 transition-all duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-sm"></div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl sm:text-2xl lg:text-4xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Wallet Analysis
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs sm:text-sm lg:text-base font-mono ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button 
                  onClick={() => setShowResults(false)}
                  className={`p-1 rounded transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 sm:mb-8">
            <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by Account, Coin, NFT, Package, Object, Transaction..."
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
          </div>
        </div>

        {/* Portfolio and NFT Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Portfolio Card */}
          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm border cursor-pointer hover:opacity-80 transition-opacity ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h3 className={`text-base sm:text-lg lg:text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Portfolio
                  </h3>
                </div>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {portfolioValue > 0 ? `${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'No value'}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {analysisData.coinHoldings.length || 0} items
                </div>
                {analysisData.isWhale && (
                  <div className="text-xs text-orange-500 font-medium mt-1">
                    🐋 Whale
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NFT Card */}
          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm border cursor-pointer hover:opacity-80 transition-opacity ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Image className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`text-base sm:text-lg lg:text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    NFTs
                  </h3>
                </div>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {nftCount || 0}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {analysisData.nftCollections.length || 0} Collections
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Portfolio Section */}
        <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border overflow-hidden ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Coin Portfolio
              </h2>
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {portfolioValue > 0 ? `${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'No holdings found'}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {hideOptions.verified} Verified
                </span>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {hideOptions.unknown} Unknown
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-xs sm:text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Activity Score: {analysisData.activityScore}
                </div>
                <div className={`text-xs sm:text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Risk: {analysisData.riskScore.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
          
          {/* Table */}
          {analysisData.coinHoldings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      #
                    </th>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      NAME
                    </th>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      PRICE
                    </th>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      BALANCE
                    </th>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      USD VALUE
                    </th>
                    <th className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      RISK
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-white/10' : 'divide-gray-200'
                }`}>
                  {analysisData.coinHoldings.map((coin, index) => (
                    <tr key={coin.id} className={`hover:${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    } transition-colors`}>
                      <td className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap text-xs sm:text-sm lg:text-base font-medium ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {index + 1}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-bold mr-2 sm:mr-3 lg:mr-4 ${
                            coin.symbol === 'SUI' ? 'bg-blue-500' :
                            coin.symbol === 'USDC' ? 'bg-green-500' :
                            coin.symbol === 'USDT' ? 'bg-emerald-500' :
                            coin.symbol === 'WETH' ? 'bg-blue-600' :
                            coin.symbol === 'CETUS' ? 'bg-purple-500' :
                            coin.symbol === 'HASUI' ? 'bg-indigo-500' :
                            'bg-gray-500'
                          }`}>
                            {coin.icon}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-xs sm:text-sm lg:text-base font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {coin.name}
                            </div>
                            {coin.isVerified && (
                              <div className="flex items-center">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1"></span>
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
                      <td className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap">
                        <div>
                          <div className={`text-xs sm:text-sm lg:text-base font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${coin.price.toFixed(coin.price >= 100 ? 2 : coin.price >= 1 ? 3 : 4)}
                          </div>
                          <div className={`text-xs flex items-center ${
                            coin.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {coin.priceChange >= 0 ? (
                              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                            )}
                            ({coin.priceChange >= 0 ? '+' : ''}{coin.priceChange.toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap text-xs sm:text-sm lg:text-base font-medium ${
                        isDark ? 'text-slate-300' : 'text-gray-900'
                      }`}>
                        {coin.balance.toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: coin.symbol === 'WETH' ? 6 : 4 
                        })} {coin.symbol}
                      </td>
                      <td className={`px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap text-xs sm:text-sm lg:text-base font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${coin.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-xs sm:text-sm lg:text-base font-semibold ${getRiskScoreColor(coin.riskScore)}`}>
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
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <Wallet className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 ${
                isDark ? 'text-slate-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                No Holdings Found
              </h3>
              <p className={`text-sm sm:text-base max-w-md mx-auto ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                This wallet doesn't appear to have any tokens or appears to be inactive.
              </p>
            </div>
          )}
        </div>

        {/* NFT Collections Section (if any) */}
        {analysisData.nftCollections.length > 0 && (
          <div className={`mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl backdrop-blur-sm border overflow-hidden ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                NFT Collections
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisData.nftCollections.map((collection, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {collection.name}
                    </h3>
                    <div className={`text-sm space-y-1 ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      <div>Count: {collection.count}</div>
                      {collection.floorPrice > 0 && (
                        <>
                          <div>Floor: {collection.floorPrice} SUI</div>
                          <div>Value: ~${collection.totalValue.toFixed(2)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};