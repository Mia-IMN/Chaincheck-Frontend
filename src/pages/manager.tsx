import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Upload, Download, Settings, TrendingUp, TrendingDown, BarChart3,
  Wallet, RefreshCw, Eye, History, Coins, Image, Layers, Zap, 
  ArrowUpDown, Shield, Activity, Target, Clock, Users, Award,
  Send, Repeat, CreditCard, PieChart, Star, AlertTriangle, Info
} from 'lucide-react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import LaunchButton from '../hooks/makePayment';
import { useSharedSession } from '../hooks/sessionTimer';

// Note: Make sure to wrap your app with WalletProvider from @suiet/wallet-kit
// Example setup in your main App.tsx or index.tsx:
// 
// import { WalletProvider } from '@suiet/wallet-kit';
// import '@suiet/wallet-kit/style.css'; // Import wallet kit styles
// 
// function App() {
//   return (
//     <WalletProvider>
//       <YourAppComponents />
//     </WalletProvider>
//   );
// }
//
// Required dependencies:
// npm install @suiet/wallet-kit @mysten/sui.js

// Types for real Sui wallet data
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

  // Sui client initialization
  const suiClient = new SuiClient({ 
    url: getFullnodeUrl('testnet') // or 'mainnet', 'devnet'
  });

  // Your smart contract package ID - update this after deployment
  const ANALYTICS_PACKAGE_ID = "YOUR_PORTFOLIO_ANALYTICS_PACKAGE_ID";

  // Load wallet data from blockchain
  useEffect(() => {
    if (connected && account?.address && isUnlocked) {
      loadWalletData();
    } else {
      setWalletData(null);
    }
  }, [connected, account?.address, isUnlocked]);

  const loadWalletData = async () => {
    if (!account?.address) {
      console.error('No wallet address available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all objects owned by the wallet
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: account.address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        }
      });

      // Analyze the wallet data
      const analytics = await analyzeWalletData(account.address, ownedObjects.data);
      setWalletData(analytics);
      
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWalletData = async (walletAddress: string, ownedObjects: any[]): Promise<WalletAnalytics> => {
    const tokens: TokenInfo[] = [];
    const nfts: NFTInfo[] = [];
    const stakingPositions: StakingInfo[] = [];
    const liquidityPositions: LiquidityInfo[] = [];
    
    let totalBalance = 0;

    // Process owned objects
    for (const obj of ownedObjects) {
      if (!obj.data) continue;

      const objectType = obj.data.type;
      
      // Check if it's a coin
      if (objectType?.includes('::coin::Coin<')) {
        const coinInfo = await processCoinObject(obj);
        if (coinInfo) {
          tokens.push(coinInfo);
          totalBalance += coinInfo.usdValue;
        }
      }
      
      // Check if it's an NFT (has display metadata)
      else if (obj.data.display && obj.data.display.data) {
        const nftInfo = await processNFTObject(obj);
        if (nftInfo) {
          nfts.push(nftInfo);
        }
      }
      
      // Check for staking objects
      else if (objectType?.includes('staking') || objectType?.includes('validator')) {
        const stakingInfo = await processStakingObject(obj);
        if (stakingInfo) {
          stakingPositions.push(stakingInfo);
        }
      }
      
      // Check for liquidity pool tokens
      else if (objectType?.includes('pool') || objectType?.includes('liquidity')) {
        const liquidityInfo = await processLiquidityObject(obj);
        if (liquidityInfo) {
          liquidityPositions.push(liquidityInfo);
        }
      }
    }

    // Get recent transactions
    const recentTransactions = await getRecentTransactions(walletAddress);

    // Calculate portfolio metrics
    const portfolioSummary = calculatePortfolioSummary(tokens, totalBalance);

    return {
      totalBalance,
      tokenCount: tokens.length,
      nftCount: nfts.length,
      transactionCount: recentTransactions.length,
      lastUpdated: Date.now(),
      tokens,
      nfts,
      recentTransactions,
      stakingPositions,
      liquidityPositions,
      portfolioSummary
    };
  };

  const processCoinObject = async (obj: any): Promise<TokenInfo | null> => {
    try {
      if (!obj.data?.content?.fields?.balance) return null;

      const balance = parseInt(obj.data.content.fields.balance);
      const coinType = obj.data.type;
      
      // Extract coin symbol from type
      const typeMatch = coinType.match(/::([A-Z]+)>/);
      const symbol = typeMatch ? typeMatch[1] : 'UNKNOWN';
      
      // Get decimals (default to 9 for SUI, 6 for USDC, etc.)
      const decimals = getCoinDecimals(symbol);
      const actualBalance = balance / Math.pow(10, decimals);
      
      // Get USD value from price API (you'd need to implement this)
      const usdValue = await getCoinUSDValue(symbol, actualBalance);
      
      return {
        coinType,
        symbol,
        balance: actualBalance,
        decimals,
        usdValue,
        change24h: Math.random() * 20 - 10, // Mock 24h change for now
        percentageOfPortfolio: 0, // Calculated later
        icon: symbol.charAt(0)
      };
    } catch (error) {
      console.error('Error processing coin object:', error);
      return null;
    }
  };

  const processNFTObject = async (obj: any): Promise<NFTInfo | null> => {
    try {
      const display = obj.data.display.data;
      
      return {
        objectId: obj.data.objectId,
        name: display.name || 'Unknown NFT',
        description: display.description || '',
        imageUrl: display.image_url || display.img_url || '',
        collection: display.collection || 'Unknown Collection',
        creator: display.creator || obj.data.owner?.AddressOwner || '',
        traits: [], // Would need to parse from metadata
        estimatedValue: Math.random() * 1000 // Mock value for now
      };
    } catch (error) {
      console.error('Error processing NFT object:', error);
      return null;
    }
  };

  const processStakingObject = async (obj: any): Promise<StakingInfo | null> => {
    // Implementation would depend on your staking contract structure
    return null;
  };

  const processLiquidityObject = async (obj: any): Promise<LiquidityInfo | null> => {
    // Implementation would depend on DEX contract structures
    return null;
  };

  const getRecentTransactions = async (walletAddress: string): Promise<TransactionInfo[]> => {
    try {
      const transactions = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: walletAddress
        },
        options: {
          showEffects: true,
          showInput: true,
        },
        limit: 10
      });

      return transactions.data.map(tx => ({
        digest: tx.digest,
        type: 'Transfer', // Would need to analyze transaction type
        amount: Math.random() * 100, // Would need to parse from effects
        coinType: 'SUI', // Would need to parse from input
        timestamp: parseInt(tx.timestampMs || '0'),
        counterparty: '0x1234...5678', // Would need to parse from effects
        status: 'Success' // Would need to check from effects
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const getCoinDecimals = (symbol: string): number => {
    const decimalsMap: { [key: string]: number } = {
      'SUI': 9,
      'USDC': 6,
      'USDT': 6,
      'WETH': 18,
      'BTC': 8
    };
    return decimalsMap[symbol] || 9;
  };

  const getCoinUSDValue = async (symbol: string, amount: number): Promise<number> => {
    // Mock prices for demo - implement real price API later
    const mockPrices: { [key: string]: number } = {
      'SUI': 2.15,
      'USDC': 1.00,
      'USDT': 1.00,
      'WETH': 3200,
      'BTC': 43000
    };
    
    const price = mockPrices[symbol] || 0;
    return amount * price;
  };

  const calculatePortfolioSummary = (tokens: TokenInfo[], totalValue: number) => {
    // Calculate percentages
    tokens.forEach(token => {
      token.percentageOfPortfolio = totalValue > 0 ? (token.usdValue / totalValue) * 100 : 0;
    });

    // Find best/worst performers
    const bestToken = tokens.reduce((best, current) => 
      current.change24h > best.change24h ? current : best, tokens[0])?.symbol || '';
    
    const worstToken = tokens.reduce((worst, current) => 
      current.change24h < worst.change24h ? current : worst, tokens[0])?.symbol || '';

    return {
      totalUsdValue: totalValue,
      bestPerformingToken: bestToken,
      worstPerformingToken: worstToken,
      diversityScore: Math.min(tokens.length * 1.5, 10), // Simple diversity calculation
      riskScore: 5 // Would need more complex risk calculation
    };
  };

  const refreshWalletData = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const addCustomToken = () => {
    if (!tokenSymbol.trim()) return;
    
    // This would call your smart contract to add a custom token
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

  const TabButton = ({ id, label, icon: Icon, count }: { 
    id: string; 
    label: string; 
    icon: React.ElementType; 
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
        activeTab === id
          ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white'
          : isDark
          ? 'text-slate-400 hover:text-white hover:bg-white/10'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
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
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Show locked version initially
  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-16 rounded-3xl backdrop-blur-sm border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] rounded-2xl flex items-center justify-center">
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
              Advanced portfolio management and analytics for your Sui wallet
            </p>
            <div className="flex justify-center">
              <LaunchButton 
                onUnlock={unlock}
                contractPackageId="0xc7c4ca2ac48106ca8cf121417e1ea371f89d7a3327a5168d7bffe1aad21d7c45" 
                configId="0x426e9437a29350c445d83ab5385e832f6efe5d47a07a4a49cdc89fc7063d17f3"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet connection if not connected
  if (!connected) {
    return (
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-16 rounded-3xl backdrop-blur-sm border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            <Wallet className={`w-24 h-24 mx-auto mb-8 ${
              isDark ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <h1 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Connect Your Sui Wallet
            </h1>
            <p className={`text-xl mb-8 ${
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
    <div className="min-h-screen pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Portfolio Analytics
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {account?.address ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : 'Wallet Overview'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                isDark 
                  ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              Quick Actions
            </button>
            <button
              onClick={refreshWalletData}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDark 
                  ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {connected && (
              <button
                onClick={disconnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                  isDark 
                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                    : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        {showQuickActions && (
          <div className={`fixed right-6 top-40 w-72 rounded-2xl backdrop-blur-sm border shadow-2xl z-50 ${
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
        )}

        {/* Add Token Modal */}
        {showAddToken && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`w-full max-w-md rounded-2xl p-8 ${
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
            <p>Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className={`w-8 h-8 animate-spin ${
                isDark ? 'text-white' : 'text-gray-900'
              }`} />
              <p className={`${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Loading wallet data from blockchain...
              </p>
            </div>
          </div>
        ) : walletData ? (
          <>
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Total Value
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(walletData.portfolioSummary.totalUsdValue)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 text-sm font-medium">
                    +12.5% (24h)
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <Coins className="w-8 h-8 text-green-500" />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Tokens
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.tokenCount}
                </p>
                {walletData.portfolioSummary.bestPerformingToken && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Best: {walletData.portfolioSummary.bestPerformingToken}
                    </span>
                  </div>
                )}
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <Image className="w-8 h-8 text-purple-500" />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    NFTs
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.nftCount}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Collections: {new Set(walletData.nfts.map(n => n.collection)).size}
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-orange-500" />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Risk Score
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {walletData.portfolioSummary.riskScore}/10
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-4 h-4 rounded-full ${
                    walletData.portfolioSummary.riskScore <= 3 ? 'bg-green-500' :
                    walletData.portfolioSummary.riskScore <= 7 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {walletData.portfolioSummary.riskScore <= 3 ? 'Low Risk' :
                     walletData.portfolioSummary.riskScore <= 7 ? 'Medium Risk' :
                     'High Risk'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white/5 rounded-2xl backdrop-blur-sm">
              <TabButton id="overview" label="Overview" icon={Eye} />
              <TabButton id="tokens" label="Tokens" icon={Coins} count={walletData.tokenCount} />
              <TabButton id="nfts" label="NFTs" icon={Image} count={walletData.nftCount} />
              <TabButton id="staking" label="Staking" icon={Shield} count={walletData.stakingPositions.length} />
              <TabButton id="defi" label="DeFi" icon={Layers} count={walletData.liquidityPositions.length} />
              <TabButton id="history" label="History" icon={History} />
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Portfolio Breakdown */}
                <div className={`lg:col-span-2 rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200 shadow-xl'
                }`}>
                  <div className={`px-8 py-6 border-b ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <h2 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Portfolio Breakdown
                    </h2>
                  </div>
                  <div className="p-8">
                    {walletData.tokens.length > 0 ? (
                      <div className="space-y-4">
                        {walletData.tokens.slice(0, 5).map((token, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                token.symbol === 'SUI' ? 'bg-blue-500' :
                                token.symbol === 'USDC' ? 'bg-green-500' :
                                token.symbol === 'WETH' ? 'bg-blue-600' :
                                'bg-gray-500'
                              }`}>
                                {token.icon}
                              </div>
                              <div>
                                <div className={`font-semibold ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {token.symbol}
                                </div>
                                <div className={`text-sm ${
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
                              <div className={`text-sm flex items-center gap-1 ${
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
                      <div className="text-center py-8">
                        <PieChart className={`w-16 h-16 mx-auto mb-4 ${
                          isDark ? 'text-slate-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-lg ${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          No tokens found in your wallet
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200 shadow-xl'
                }`}>
                  <div className={`px-6 py-4 border-b ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recent Activity
                    </h3>
                  </div>
                  <div className="p-6">
                    {walletData.recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {walletData.recentTransactions.slice(0, 5).map((tx, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'Send' ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                              {tx.type === 'Send' ? 
                                <ArrowUpDown className="w-4 h-4 text-white" /> : 
                                <Download className="w-4 h-4 text-white" />
                              }
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
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
                            <div className={`text-sm font-medium ${
                              isDark ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              {tx.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className={`w-12 h-12 mx-auto mb-4 ${
                          isDark ? 'text-slate-600' : 'text-gray-400'
                        }`} />
                        <p className={`${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          No recent transactions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className={`rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-8 py-6 border-b flex items-center justify-between ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Token Holdings
                  </h2>
                  <button
                    onClick={() => setShowAddToken(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Add Token
                  </button>
                </div>
                
                {walletData.tokens.length > 0 ? (
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
                            Balance
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
                        {walletData.tokens.map((token, index) => (
                          <tr key={index} className={`hover:${
                            isDark ? 'bg-white/5' : 'bg-gray-50'
                          } transition-colors`}>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                                  token.symbol === 'SUI' ? 'bg-blue-500' :
                                  token.symbol === 'USDC' ? 'bg-green-500' :
                                  token.symbol === 'WETH' ? 'bg-blue-600' :
                                  'bg-gray-500'
                                }`}>
                                  {token.icon}
                                </div>
                                <div>
                                  <div className={`text-lg font-semibold ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {token.symbol}
                                  </div>
                                  <div className={`text-sm ${
                                    isDark ? 'text-slate-400' : 'text-gray-500'
                                  }`}>
                                    {token.coinType.slice(0, 20)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-8 py-6 whitespace-nowrap text-lg font-medium ${
                              isDark ? 'text-slate-300' : 'text-gray-900'
                            }`}>
                              {token.balance.toLocaleString()}
                            </td>
                            <td className={`px-8 py-6 whitespace-nowrap text-lg font-bold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatCurrency(token.usdValue)}
                            </td>
                            <td className={`px-8 py-6 whitespace-nowrap ${
                              token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              <div className="flex items-center gap-1">
                                {token.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {token.change24h.toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                                  isDark 
                                    ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}>
                                  Send
                                </button>
                                <button className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                                  isDark 
                                    ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}>
                                  Swap
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Coins className={`w-16 h-16 mx-auto mb-4 ${
                      isDark ? 'text-slate-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg mb-4 ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      No tokens found in your wallet
                    </p>
                    <button
                      onClick={() => setShowAddToken(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      Add Your First Token
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs with improved styling */}
            {activeTab === 'nfts' && (
              <div className={`rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className={`px-8 py-6 border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <h2 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    NFT Collection
                  </h2>
                </div>
                {walletData.nfts.length > 0 ? (
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                              <Image className="w-16 h-16 text-white" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className={`font-bold mb-1 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {nft.name}
                            </h3>
                            <p className={`text-sm ${
                              isDark ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              {nft.collection}
                            </p>
                            {nft.estimatedValue > 0 && (
                              <div className="mt-2">
                                <span className={`text-sm font-medium ${
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
                  <div className="p-8 text-center">
                    <Image className={`w-16 h-16 mx-auto mb-4 ${
                      isDark ? 'text-slate-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      No NFTs found in your wallet
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className={`text-lg ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              No wallet data available. Please connect your wallet and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};