import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Upload, Download, Settings, TrendingUp, TrendingDown, BarChart3,
  Wallet, RefreshCw, Eye, History, Coins, Image, Layers, Zap, 
  ArrowUpDown, Shield, Activity, Target, Clock, Users, Award,
  Send, Repeat, CreditCard, PieChart, Star, AlertTriangle, Info,
  Menu, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import LaunchButton from '../hooks/makePayment';
import { useSharedSession } from '../hooks/sessionTimer';

interface TokenInfo {
  coinType: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue: number;
  change24h: number;
  percentageOfPortfolio: number;
  icon: string;
}

interface NFTInfo {
  objectId: string;
  name: string;
  description: string;
  imageUrl: string;
  collection: string;
  creator: string;
  traits: TraitInfo[];
  estimatedValue: number;
}

interface TraitInfo {
  traitType: string;
  value: string;
  rarityScore: number;
}

interface TransactionInfo {
  digest: string;
  type: string;
  amount: number;
  coinType: string;
  timestamp: number;
  counterparty: string;
  status: string;
}

interface StakingInfo {
  validator: string;
  stakedAmount: number;
  rewardsEarned: number;
  epochStarted: number;
  apy: number;
}

interface LiquidityInfo {
  poolId: string;
  tokenA: string;
  tokenB: string;
  liquidityAmount: number;
  sharePercentage: number;
  feesEarned: number;
}

interface WalletAnalytics {
  totalBalance: number;
  tokenCount: number;
  nftCount: number;
  transactionCount: number;
  lastUpdated: number;
  tokens: TokenInfo[];
  nfts: NFTInfo[];
  recentTransactions: TransactionInfo[];
  stakingPositions: StakingInfo[];
  liquidityPositions: LiquidityInfo[];
  portfolioSummary: {
    totalUsdValue: number;
    bestPerformingToken: string;
    worstPerformingToken: string;
    diversityScore: number;
    riskScore: number;
  };
}

interface PortfolioPageProps {
  isDark: boolean;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isDark }) => {
  const { isUnlocked, unlock } = useSharedSession();
  const { connected, account, select, disconnect } = useWallet();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'nfts' | 'staking' | 'defi' | 'history'>('overview');
  const [walletData, setWalletData] = useState<WalletAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sui client initialization
  const suiClient = new SuiClient({ 
    url: getFullnodeUrl('testnet')
  });

  const ANALYTICS_PACKAGE_ID = "0xf1845f05aba533e4656436af6c3622d214e7f6e0befbae14eef6d2b23462d0e6";

  useEffect(() => {
    if (connected && account?.address && isUnlocked) {
      loadWalletData();
    } else {
      setWalletData(null);
    }
  }, [connected, account?.address, isUnlocked]);

  const loadWalletData = async () => {
    if (!account?.address) {
      setError('No wallet address available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: account.address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        }
      });

      const analytics = await analyzeWalletData(account.address, ownedObjects.data);
      setWalletData(analytics);
      
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet data');
      setWalletData(createEmptyAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const createEmptyAnalytics = (): WalletAnalytics => ({
    totalBalance: 0,
    tokenCount: 0,
    nftCount: 0,
    transactionCount: 0,
    lastUpdated: Date.now(),
    tokens: [],
    nfts: [],
    recentTransactions: [],
    stakingPositions: [],
    liquidityPositions: [],
    portfolioSummary: {
      totalUsdValue: 0,
      bestPerformingToken: '',
      worstPerformingToken: '',
      diversityScore: 0,
      riskScore: 0
    }
  });

  const analyzeWalletData = async (walletAddress: string, ownedObjects: any[]): Promise<WalletAnalytics> => {
    try {
      const analytics = createEmptyAnalytics();
      analytics.lastUpdated = Date.now();

      // Process owned objects to find tokens and NFTs
      const coinObjects = [];
      const nftObjects = [];

      for (const obj of ownedObjects) {
        if (obj.data?.type?.includes('::coin::Coin<')) {
          coinObjects.push(obj);
        } else if (obj.data?.display || obj.data?.content?.fields) {
          nftObjects.push(obj);
        }
      }

      // Process coins/tokens
      const tokenMap = new Map<string, TokenInfo>();
      
      for (const coinObj of coinObjects) {
        const coinType = extractCoinType(coinObj.data.type);
        const balance = extractCoinBalance(coinObj.data);
        
        if (balance > 0) {
          const symbol = getCoinSymbol(coinType);
          const decimals = getCoinDecimals(coinType);
          const usdPrice = await fetchTokenPrice(symbol);
          const actualBalance = balance / Math.pow(10, decimals);
          const usdValue = actualBalance * usdPrice;
          
          if (tokenMap.has(symbol)) {
            const existing = tokenMap.get(symbol)!;
            existing.balance += actualBalance;
            existing.usdValue += usdValue;
          } else {
            tokenMap.set(symbol, {
              coinType,
              symbol,
              balance: actualBalance,
              decimals,
              usdValue,
              change24h: await fetchTokenPriceChange(symbol),
              percentageOfPortfolio: 0,
              icon: symbol.charAt(0).toUpperCase()
            });
          }
        }
      }

      analytics.tokens = Array.from(tokenMap.values());
      analytics.tokenCount = analytics.tokens.length;
      analytics.totalBalance = analytics.tokens.reduce((sum, token) => sum + token.usdValue, 0);

      // Calculate portfolio percentages
      if (analytics.totalBalance > 0) {
        analytics.tokens.forEach(token => {
          token.percentageOfPortfolio = (token.usdValue / analytics.totalBalance) * 100;
        });
      }

      // Process NFTs
      for (const nftObj of nftObjects) {
        const nftInfo = await processNFTObject(nftObj);
        if (nftInfo) {
          analytics.nfts.push(nftInfo);
        }
      }
      analytics.nftCount = analytics.nfts.length;

      // Get transaction history
      try {
        const transactions = await suiClient.queryTransactionBlocks({
          filter: {
            FromAddress: walletAddress
          },
          options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
          },
          limit: 50,
          order: 'descending'
        });

        analytics.recentTransactions = await processTransactions(transactions.data, walletAddress);
        analytics.transactionCount = transactions.data.length;
      } catch (txError) {
        console.warn('Failed to fetch transaction history:', txError);
      }

      // Calculate portfolio summary
      analytics.portfolioSummary = calculatePortfolioSummary(analytics);

      return analytics;
    } catch (error) {
      console.error('Error analyzing wallet data:', error);
      throw new Error('Failed to analyze wallet data from blockchain');
    }
  };

  const extractCoinType = (type: string): string => {
    const match = type.match(/::coin::Coin<(.+)>/);
    return match ? match[1] : type;
  };

  const extractCoinBalance = (coinData: any): number => {
    if (coinData?.content?.fields?.balance) {
      return parseInt(coinData.content.fields.balance);
    }
    return 0;
  };

  const getCoinSymbol = (coinType: string): string => {
    if (coinType.includes('::sui::SUI')) return 'SUI';
    if (coinType.includes('usdc')) return 'USDC';
    if (coinType.includes('usdt')) return 'USDT';
    
    // Extract symbol from coin type
    const parts = coinType.split('::');
    return parts[parts.length - 1] || 'UNKNOWN';
  };

  const getCoinDecimals = (coinType: string): number => {
    if (coinType.includes('::sui::SUI')) return 9;
    if (coinType.includes('usdc')) return 6;
    if (coinType.includes('usdt')) return 6;
    return 9; // Default
  };

  const fetchTokenPrice = async (symbol: string): Promise<number> => {
    try {
      // You can integrate with a price API here
      // For now, return basic prices
      const prices: { [key: string]: number } = {
        'SUI': 3.20,
        'USDC': 1.00,
        'USDT': 1.00,
      };
      return prices[symbol] || 0;
    } catch {
      return 0;
    }
  };

  const fetchTokenPriceChange = async (symbol: string): Promise<number> => {
    try {
      // You can integrate with a price API here for 24h change
      // For now, return random changes for demo
      const changes: { [key: string]: number } = {
        'SUI': 12.5,
        'USDC': 0.1,
        'USDT': -0.05,
      };
      return changes[symbol] || 0;
    } catch {
      return 0;
    }
  };

  const processNFTObject = async (nftObj: any): Promise<NFTInfo | null> => {
    try {
      const display = nftObj.data?.display?.data;
      const content = nftObj.data?.content?.fields;
      
      if (!display && !content) return null;

      return {
        objectId: nftObj.data.objectId,
        name: display?.name || content?.name || 'Unknown NFT',
        description: display?.description || content?.description || '',
        imageUrl: display?.image_url || content?.image_url || '',
        collection: display?.collection || content?.collection || 'Unknown Collection',
        creator: display?.creator || content?.creator || nftObj.data.owner || '',
        traits: extractNFTTraits(content),
        estimatedValue: 0 // You can implement price estimation logic
      };
    } catch {
      return null;
    }
  };

  const extractNFTTraits = (content: any): TraitInfo[] => {
    const traits: TraitInfo[] = [];
    
    if (content?.attributes || content?.traits) {
      const traitData = content.attributes || content.traits;
      if (Array.isArray(traitData)) {
        traitData.forEach((trait: any) => {
          if (trait.trait_type && trait.value) {
            traits.push({
              traitType: trait.trait_type,
              value: trait.value.toString(),
              rarityScore: trait.rarity_score || 0
            });
          }
        });
      }
    }
    
    return traits;
  };

  const processTransactions = async (transactions: any[], walletAddress: string): Promise<TransactionInfo[]> => {
    const processed: TransactionInfo[] = [];

    for (const tx of transactions.slice(0, 20)) {
      try {
        const txInfo: TransactionInfo = {
          digest: tx.digest,
          type: determineTransactionType(tx, walletAddress),
          amount: extractTransactionAmount(tx),
          coinType: extractTransactionCoinType(tx),
          timestamp: parseInt(tx.timestampMs || Date.now().toString()),
          counterparty: extractCounterparty(tx, walletAddress),
          status: tx.effects?.status?.status === 'success' ? 'Success' : 'Failed'
        };
        processed.push(txInfo);
      } catch (error) {
        console.warn('Failed to process transaction:', tx.digest, error);
      }
    }

    return processed;
  };

  const determineTransactionType = (tx: any, walletAddress: string): string => {
    // Analyze transaction effects to determine type
    const effects = tx.effects;
    if (effects?.created?.length > 0) return 'Mint';
    if (effects?.deleted?.length > 0) return 'Burn';
    
    // Check for transfers
    const balanceChanges = effects?.balanceChanges || [];
    const hasOutgoing = balanceChanges.some((change: any) => 
      change.owner === walletAddress && parseInt(change.amount) < 0
    );
    
    return hasOutgoing ? 'Send' : 'Receive';
  };

  const extractTransactionAmount = (tx: any): number => {
    const balanceChanges = tx.effects?.balanceChanges || [];
    if (balanceChanges.length > 0) {
      const amount = Math.abs(parseInt(balanceChanges[0].amount || '0'));
      return amount / 1000000000; // Convert from MIST to SUI
    }
    return 0;
  };

  const extractTransactionCoinType = (tx: any): string => {
    const balanceChanges = tx.effects?.balanceChanges || [];
    if (balanceChanges.length > 0) {
      return getCoinSymbol(balanceChanges[0].coinType || '');
    }
    return 'SUI';
  };

  const extractCounterparty = (tx: any, walletAddress: string): string => {
    const balanceChanges = tx.effects?.balanceChanges || [];
    for (const change of balanceChanges) {
      if (change.owner !== walletAddress) {
        return change.owner;
      }
    }
    return '';
  };

  const calculatePortfolioSummary = (analytics: WalletAnalytics) => {
    const summary = {
      totalUsdValue: analytics.totalBalance,
      totalTokens: analytics.tokenCount,
      totalNfts: analytics.nftCount,
      bestPerformingToken: '',
      worstPerformingToken: '',
      portfolioDiversityScore: 0,
      riskScore: 0
    };

    if (analytics.tokens.length > 0) {
      // Find best and worst performing tokens
      const sortedByChange = [...analytics.tokens].sort((a, b) => b.change24h - a.change24h);
      summary.bestPerformingToken = sortedByChange[0]?.symbol || '';
      summary.worstPerformingToken = sortedByChange[sortedByChange.length - 1]?.symbol || '';

      // Calculate diversity score (0-10 scale)
      const diversityScore = Math.min(analytics.tokenCount * 2, 10);
      summary.portfolioDiversityScore = diversityScore;

      // Calculate risk score (0-10 scale, higher = more risky)
      const concentrationRisk = analytics.tokens.length === 1 ? 3 : 
                              analytics.tokens.length <= 3 ? 2 : 1;
      const volatilityRisk = analytics.tokens.reduce((avg, token) => 
        avg + Math.abs(token.change24h), 0) / analytics.tokens.length / 10;
      
      summary.riskScore = Math.min(concentrationRisk + volatilityRisk, 10);
    }

    return {
      totalUsdValue: summary.totalUsdValue,
      bestPerformingToken: summary.bestPerformingToken,
      worstPerformingToken: summary.worstPerformingToken,
      diversityScore: summary.portfolioDiversityScore * 100, // Convert to basis points
      riskScore: summary.riskScore * 100 // Convert to basis points
    };
  };

  const refreshWalletData = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const addCustomToken = () => {
    if (!tokenSymbol.trim()) return;
    console.log('Adding custom token:', tokenSymbol);
    setTokenSymbol('');
    setShowAddToken(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Mobile-friendly Tab Button
  const TabButton = ({ id, label, icon: Icon, count }: { 
    id: string; 
    label: string; 
    icon: React.ElementType; 
    count?: number;
  }) => (
    <button
      onClick={() => {
        setActiveTab(id as any);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base min-w-0 ${
        activeTab === id
          ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white'
          : isDark
          ? 'text-slate-400 hover:text-white hover:bg-white/10'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
          activeTab === id
            ? 'bg-white/20'
            : isDark
            ? 'bg-white/10'
            : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const QuickAction = ({ icon: Icon, label, onClick }: { 
    icon: React.ElementType; 
    label: string; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${
        isDark 
          ? 'hover:bg-white/10 text-slate-300' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium truncate">{label}</span>
    </button>
  );

  // No Data Component
  const NoDataDisplay = ({ icon: Icon, title, description }: {
    icon: React.ElementType;
    title: string;
    description: string;
  }) => (
    <div className="text-center py-8 sm:py-12">
      <Icon className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 ${
        isDark ? 'text-slate-600' : 'text-gray-400'
      }`} />
      <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
        isDark ? 'text-slate-300' : 'text-gray-700'
      }`}>
        {title}
      </h3>
      <p className={`text-sm sm:text-base max-w-md mx-auto ${
        isDark ? 'text-slate-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
    </div>
  );

  const features = [
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
  ];
  
  // Show locked version initially
  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 lg:pt-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-6 sm:p-8 lg:p-16 rounded-3xl backdrop-blur-sm border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Portfolio Intelligence
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Advanced portfolio management and analytics for your Sui wallet
            </p>
            <div className="flex justify-center mb-8 sm:mb-12">
              <LaunchButton 
                onUnlock={unlock}
                contractPackageId="0xf1845f05aba533e4656436af6c3622d214e7f6e0befbae14eef6d2b23462d0e6" 
                configId="0xa8464ca3ce0ddb185b6f58c497386ef826a033c718cf9c5e8ecdde517490da38"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
              {features.map((feature, index) => (
                <div key={index} className={`p-4 sm:p-6 rounded-xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`font-semibold mb-2 text-sm sm:text-base ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs sm:text-sm ${
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

  // Show wallet connection if not connected
  if (!connected) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 lg:pt-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-6 sm:p-8 lg:p-16 rounded-3xl backdrop-blur-sm border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <Wallet className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-6 sm:mb-8 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Connect Your Sui Wallet
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Connect your wallet to view your real portfolio analytics and manage your assets
            </p>
            <ConnectButton 
              style={{
                background: 'linear-gradient(135deg, #2F5A8A 0%, #437AF3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Connect Wallet
            </ConnectButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 lg:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-first Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Portfolio Analytics
            </h1>
            <p className={`text-sm sm:text-base lg:text-lg truncate ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {account?.address ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : 'Wallet Overview'}
            </p>
          </div>
          
          {/* Mobile action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl border transition-colors ${
                isDark 
                  ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Quick Actions</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={refreshWalletData}
                disabled={refreshing}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl border transition-colors ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isDark 
                    ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {connected && (
                <button
                  onClick={disconnect}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl border transition-colors ${
                    isDark 
                      ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar - Mobile-friendly */}
        {showQuickActions && (
          <>
            {/* Mobile backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setShowQuickActions(false)}
            />
            
            <div className={`fixed right-4 top-20 sm:top-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl backdrop-blur-sm border shadow-2xl z-50 ${
              isDark 
                ? 'bg-slate-900/90 border-white/10' 
                : 'bg-white/90 border-gray-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Quick Actions
                  </h3>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-white/10 text-slate-400' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <QuickAction 
                    icon={Send} 
                    label="Send Tokens" 
                    onClick={() => console.log('Send tokens')} 
                  />
                  <QuickAction 
                    icon={Repeat} 
                    label="Swap Tokens" 
                    onClick={() => console.log('Swap tokens')} 
                  />
                  <QuickAction 
                    icon={Plus} 
                    label="Add Token" 
                    onClick={() => setShowAddToken(true)} 
                  />
                  <QuickAction 
                    icon={Shield} 
                    label="Stake SUI" 
                    onClick={() => console.log('Stake SUI')} 
                  />
                  <QuickAction 
                    icon={Download} 
                    label="Export Data" 
                    onClick={() => console.log('Export data')} 
                  />
                  <QuickAction 
                    icon={Settings} 
                    label="Settings" 
                    onClick={() => console.log('Settings')} 
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Token Modal - Mobile-friendly */}
        {showAddToken && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl p-6 sm:p-8 ${
              isDark 
                ? 'bg-slate-900 border border-white/10' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Custom Token
                </h3>
                <button
                  onClick={() => setShowAddToken(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark 
                      ? 'hover:bg-white/10 text-slate-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="e.g., USDC, WETH"
                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddToken(false)}
                    className={`flex-1 px-4 py-3 rounded-xl border font-medium transition-colors ${
                      isDark 
                        ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomToken}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Add Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`p-4 rounded-xl mb-6 ${
            isDark 
              ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className={`w-8 h-8 animate-spin ${
                isDark ? 'text-white' : 'text-gray-900'
              }`} />
              <p className={`text-center ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Loading wallet data from blockchain...
              </p>
            </div>
          </div>
        ) : walletData ? (
          <>
            {/* Portfolio Overview Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className={`p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <BarChart3 className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-blue-500" />
                  <span className={`text-xs sm:text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Total Value
                  </span>
                </div>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.portfolioSummary.totalUsdValue > 0 
                    ? formatCurrency(walletData.portfolioSummary.totalUsdValue)
                    : 'No data'
                  }
                </p>
                {walletData.portfolioSummary.totalUsdValue === 0 && (
                  <div className={`text-xs sm:text-sm mt-1 ${
                    isDark ? 'text-slate-500' : 'text-gray-500'
                  }`}>
                    Connect wallet to view balance
                  </div>
                )}
              </div>

              <div className={`p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Coins className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-green-500" />
                  <span className={`text-xs sm:text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Tokens
                  </span>
                </div>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.tokenCount || 0}
                </p>
                <div className={`text-xs sm:text-sm mt-1 ${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  {walletData.tokenCount === 0 ? 'No tokens found' : 'Different tokens'}
                </div>
              </div>

              <div className={`p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Image className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-purple-500" />
                  <span className={`text-xs sm:text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    NFTs
                  </span>
                </div>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.nftCount || 0}
                </p>
                <div className={`text-xs sm:text-sm mt-1 ${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  {walletData.nftCount === 0 ? 'No NFTs found' : 'Digital collectibles'}
                </div>
              </div>

              <div className={`p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Shield className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-orange-500" />
                  <span className={`text-xs sm:text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Risk Score
                  </span>
                </div>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.portfolioSummary.riskScore > 0 
                    ? `${(walletData.portfolioSummary.riskScore / 100).toFixed(1)}/10`
                    : 'N/A'
                  }
                </p>
                <div className={`text-xs sm:text-sm mt-1 ${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  {walletData.portfolioSummary.riskScore === 0 ? 'No data available' : 'Portfolio risk level'}
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation - Improved */}
            <div className="mb-6 sm:mb-8">
              {/* Mobile dropdown */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <span className="font-medium">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${
                    isMobileMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isMobileMenuOpen && (
                  <div className={`mt-2 p-2 rounded-xl border ${
                    isDark 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="grid grid-cols-3 gap-2">
                      <TabButton id="overview" label="Overview" icon={Eye} />
                      <TabButton id="tokens" label="Tokens" icon={Coins} count={walletData.tokenCount} />
                      <TabButton id="nfts" label="NFTs" icon={Image} count={walletData.nftCount} />
                      <TabButton id="staking" label="Staking" icon={Shield} count={walletData.stakingPositions.length} />
                      <TabButton id="defi" label="DeFi" icon={Layers} count={walletData.liquidityPositions.length} />
                      <TabButton id="history" label="History" icon={History} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Desktop tab navigation - Scrollable */}
              <div className="hidden sm:block">
                <div className="flex gap-2 p-2 bg-white/5 rounded-2xl backdrop-blur-sm overflow-x-auto">
                  <TabButton id="overview" label="Overview" icon={Eye} />
                  <TabButton id="tokens" label="Tokens" icon={Coins} count={walletData.tokenCount} />
                  <TabButton id="nfts" label="NFTs" icon={Image} count={walletData.nftCount} />
                  <TabButton id="staking" label="Staking" icon={Shield} count={walletData.stakingPositions.length} />
                  <TabButton id="defi" label="DeFi" icon={Layers} count={walletData.liquidityPositions.length} />
                  <TabButton id="history" label="History" icon={History} />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Portfolio Breakdown */}
                <div className={`lg:col-span-2 rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200 shadow-xl'
                }`}>
                  <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Portfolio Breakdown
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    {walletData.tokens.length > 0 ? (
                      <div className="space-y-4">
                        {walletData.tokens.slice(0, 5).map((token, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                token.symbol === 'SUI' ? 'bg-blue-500' :
                                token.symbol === 'USDC' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`}>
                                {token.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`text-sm sm:text-base font-semibold truncate ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {token.symbol}
                                </div>
                                <div className={`text-xs sm:text-sm truncate ${
                                  isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  {token.balance.toLocaleString()} tokens
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm sm:text-base font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatCurrency(token.usdValue)}
                              </div>
                              <div className={`text-xs sm:text-sm flex items-center justify-end gap-1 ${
                                token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {token.change24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NoDataDisplay 
                        icon={PieChart}
                        title="No Token Data Available"
                        description="Connect your wallet and ensure it contains tokens to view your portfolio breakdown."
                      />
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200 shadow-xl'
                }`}>
                  <div className={`px-4 sm:px-6 py-4 border-b ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <h3 className={`text-base sm:text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recent Activity
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    {walletData.recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {walletData.recentTransactions.slice(0, 5).map((tx, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              tx.type === 'Send' ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              {tx.type === 'Send' ? 
                                <ArrowUpDown className="w-3 sm:w-4 h-3 sm:h-4 text-white" /> : 
                                <Download className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs sm:text-sm font-medium truncate ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {tx.type} {tx.coinType}
                              </div>
                              <div className={`text-xs ${
                                isDark ? 'text-slate-400' : 'text-gray-500'
                              }`}>
                                {formatTimeAgo(tx.timestamp)}
                              </div>
                            </div>
                            <div className={`text-xs sm:text-sm font-medium ${
                              isDark ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              {tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NoDataDisplay 
                        icon={Activity}
                        title="No Recent Activity"
                        description="Your transaction history will appear here once you start using your wallet."
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Token Holdings
                  </h2>
                  <button
                    onClick={() => setShowAddToken(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Add Token
                  </button>
                </div>
                
                {walletData.tokens.length > 0 ? (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="space-y-4">
                      {walletData.tokens.map((token, index) => (
                        <div key={index} className={`p-4 rounded-xl border ${
                          isDark 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                token.symbol === 'SUI' ? 'bg-blue-500' :
                                token.symbol === 'USDC' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`}>
                                {token.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`font-semibold truncate ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {token.symbol}
                                </div>
                                <div className={`text-sm truncate ${
                                  isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  {token.balance.toLocaleString()} tokens
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatCurrency(token.usdValue)}
                              </div>
                              <div className={`text-sm flex items-center justify-end gap-1 ${
                                token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {token.change24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              isDark 
                                ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}>
                              Send
                            </button>
                            <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              isDark 
                                ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}>
                              Swap
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    <NoDataDisplay 
                      icon={Coins}
                      title="No Tokens Found"
                      description="Your wallet doesn't contain any tokens yet. Add tokens to your wallet or connect a different wallet to view your holdings."
                    />
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setShowAddToken(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Add Your First Token
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NFTs Tab */}
            {activeTab === 'nfts' && (
              <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    NFT Collection
                  </h2>
                </div>
                {walletData.nfts.length > 0 ? (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {walletData.nfts.map((nft, index) => (
                        <div key={index} className={`rounded-2xl border overflow-hidden ${
                          isDark 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            {nft.imageUrl ? (
                              <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-12 sm:w-16 h-12 sm:h-16 text-white" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className={`font-bold mb-1 text-sm sm:text-base truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {nft.name}
                            </h3>
                            <p className={`text-xs sm:text-sm truncate ${
                              isDark ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              {nft.collection}
                            </p>
                            {nft.estimatedValue > 0 && (
                              <div className="mt-2">
                                <span className={`text-xs sm:text-sm font-medium ${
                                  isDark ? 'text-slate-300' : 'text-gray-700'
                                }`}>
                                  Est. {formatCurrency(nft.estimatedValue)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    <NoDataDisplay 
                      icon={Image}
                      title="No NFTs Found"
                      description="Your wallet doesn't contain any NFTs yet. Purchase or mint NFTs to see them in your collection."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Staking Tab */}
            {activeTab === 'staking' && (
              <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Staking Positions
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  <NoDataDisplay 
                    icon={Shield}
                    title="No Staking Positions"
                    description="You don't have any active staking positions. Start staking your SUI tokens to earn rewards."
                  />
                </div>
              </div>
            )}

            {/* DeFi Tab */}
            {activeTab === 'defi' && (
              <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    DeFi Positions
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  <NoDataDisplay 
                    icon={Layers}
                    title="No DeFi Positions"
                    description="You don't have any active DeFi positions. Explore liquidity pools and yield farming opportunities."
                  />
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className={`rounded-2xl sm:rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transaction History
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  {walletData.recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {walletData.recentTransactions.map((tx, index) => (
                        <div key={index} className={`p-4 rounded-xl border ${
                          isDark 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === 'Send' ? 'bg-red-500' : 'bg-green-500'
                              }`}>
                                {tx.type === 'Send' ? 
                                  <ArrowUpDown className="w-4 h-4 text-white" /> : 
                                  <Download className="w-4 h-4 text-white" />
                                }
                              </div>
                              <div>
                                <div className={`font-medium ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {tx.type} {tx.coinType}
                                </div>
                                <div className={`text-sm ${
                                  isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  {formatTimeAgo(tx.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {tx.amount.toFixed(4)} {tx.coinType}
                              </div>
                              <div className={`text-sm ${
                                tx.status === 'Success' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {tx.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <NoDataDisplay 
                      icon={History}
                      title="No Transaction History"
                      description="Your transaction history will appear here once you start using your wallet for transfers and swaps."
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <NoDataDisplay 
              icon={Wallet}
              title="No Wallet Data Available"
              description="Please connect your wallet and try again. Make sure your wallet contains some tokens or NFTs."
            />
          </div>
        )}
      </div>
    </div>
  );
};