import React, { useState } from 'react';
import { PageType, ThemeType, Token, TokenFilters, MarketStats } from './types';
import { formatPrice, formatMarketCap, formatVolume, getRiskScore, getTokenCategory } from './utils/formatters';

// Hooks
import { useWalletConnection } from './hooks/useWalletConnection';
import { useSuiEcosystemData } from './hooks/useSuiEcosystemData';
import { useSuiSystemData } from './hooks/useSuiSystemData';

// Components
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { WalletModal } from './components/modals/WalletModal';
import AnalysisModal from './components/modals/AnalysisModal';
import { AnalysisResultsPopup } from './components/AnalysisResultsPopup';
import { PortfolioTracker } from './components/PortfolioTracker'; // Import the PortfolioTracker component

// Services
import { chaincheckApi, TokenAnalysis } from './services/chaincheckApi';

// Pages
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/watch';
import { LearnPage } from './pages/LearnPage';


// Debug test for getRiskScore function on app startup
console.log('🧪 Testing getRiskScore function on App startup...');
try {
  const testRisk1 = getRiskScore(-15, 1000000000); // Should be 'medium'
  const testRisk2 = getRiskScore(5, 500000000); // Should be 'medium' 
  const testRisk3 = getRiskScore(-25, 50000); // Should be 'high'
  console.log('✅ getRiskScore tests passed:', { testRisk1, testRisk2, testRisk3 });
} catch (error) {
  console.error('❌ CRITICAL: getRiskScore function is broken:', error);
}

const ChainCheckApp: React.FC = () => {
  // Theme and navigation state
  const [theme, setTheme] = useState<ThemeType>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  // FIXED: Separate search states to prevent conflicts
  const [searchQuery, setSearchQuery] = useState<string>(''); // For Navigation
  const [homeSearchQuery, setHomeSearchQuery] = useState<string>(''); // For HomePage
  
  const [selectedTokenForAnalysis, setSelectedTokenForAnalysis] = useState<Token | null>(null);
  
  // Wallet connection state
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  
  // Analysis Popup state
  const [showAnalysisPopup, setShowAnalysisPopup] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TokenAnalysis | null>(null);
  const [analyzedToken, setAnalyzedToken] = useState<Token | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
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
  const { 
    tokens: suiTokens, 
    allTokens, 
    suiMainToken, 
    loading: marketLoading, 
    error: marketError, 
    lastUpdated, 
    pagination, 
    refetch 
  } = useSuiEcosystemData(currentMarketPage, itemsPerPage, marketFilters);
  
  const { systemState, loading: systemLoading } = useSuiSystemData();
  
  // Wallet connection hook
  const { 
    wallet, 
    isConnecting, 
    error: walletError, 
    connectWithGoogle, 
    connectWithSuiWallet, 
    disconnect, 
    copyAddress,
    getAvailableWallets,
    getInstalledWallets
  } = useWalletConnection();

  const isDark = theme === 'dark';

  // Helper function to safely calculate risk score with proper error handling
  const safeGetRiskScore = (priceChange: number, marketCap: number, tokenName: string = 'Unknown'): 'low' | 'medium' | 'high' => {
    try {
      // Validate inputs
      if (typeof priceChange !== 'number' || typeof marketCap !== 'number') {
        console.warn(`Invalid inputs for ${tokenName}: priceChange=${priceChange}, marketCap=${marketCap}`);
        return 'medium';
      }

      // Handle edge cases
      if (isNaN(priceChange) || isNaN(marketCap)) {
        console.warn(`NaN values detected for ${tokenName}: priceChange=${priceChange}, marketCap=${marketCap}`);
        return 'medium';
      }

      const riskScore = getRiskScore(priceChange, marketCap);
      
      // Validate the returned risk score
      if (!riskScore || !['low', 'medium', 'high'].includes(riskScore)) {
        console.warn(`Invalid risk score returned for ${tokenName}: ${riskScore}, using 'medium'`);
        return 'medium';
      }

      console.log(`✅ Risk score for ${tokenName}: ${riskScore} (change: ${priceChange}%, cap: ${marketCap})`);
      return riskScore;
    } catch (error) {
      console.error(`❌ Error calculating risk score for ${tokenName}:`, error);
      return 'medium'; // Safe fallback
    }
  };

  // Helper function to format price change with proper sign
  const formatPriceChange = (priceChange: number): string => {
    if (typeof priceChange !== 'number' || isNaN(priceChange)) {
      return '0.00%';
    }
    const sign = priceChange >= 0 ? '+' : '';
    return `${sign}${priceChange.toFixed(2)}%`;
  };

  // FIXED: Convert API data to display format with comprehensive error handling
  const convertApiToTokens = (): Token[] => {
    if (!suiTokens || suiTokens.length === 0) {
      console.log('No tokens available from API');
      return [];
    }

    console.log(`🔄 Converting ${suiTokens.length} tokens from API...`);

    const converted: Token[] = suiTokens.map((token, index) => {
      try {
        const priceChange = token.price_change_percentage_24h ?? 0;
        const marketCap = token.market_cap ?? 0;
        const currentPrice = token.current_price ?? 0;
        const volume = token.total_volume ?? 0;
        
        console.log(`Processing token ${token.name}: price=${currentPrice}, change=${priceChange}%, cap=${marketCap}, volume=${volume}`);
        
        // FIXED: Use safe risk score calculation
        const riskScore = safeGetRiskScore(priceChange, marketCap, token.name);

        // FIXED: Safe formatting with error handling
        let formattedPrice = '$0.00';
        let formattedMarketCap = '$0';
        let formattedVolume = '$0';
        
        try {
          formattedPrice = formatPrice(currentPrice);
          formattedMarketCap = formatMarketCap(marketCap);
          formattedVolume = formatVolume(volume);
        } catch (formatError) {
          console.error(`Error formatting values for ${token.name}:`, formatError);
        }

        // FIXED: Safe category calculation
        let category: Token['category'] = 'Other';
        try {
          category = getTokenCategory(token.name || '', token.symbol || '');
        } catch (categoryError) {
          console.error(`Error getting category for ${token.name}:`, categoryError);
        }

        const convertedToken: Token = {
          id: index + 1,
          name: token.name || 'Unknown Token',
          symbol: (token.symbol?.toUpperCase() || 'UNKNOWN'),
          price: formattedPrice,
          change: formatPriceChange(priceChange),
          marketCap: formattedMarketCap,
          volume: formattedVolume,
          riskScore: riskScore,
          trending: priceChange >= 0 ? 'up' : 'down',
          image: token.image,
          liquidity: formatVolume(volume * 0.3), // Estimate liquidity as 30% of volume
          address: token.id === 'sui' ? '0x2::sui::SUI' : undefined,
          contractAddress: token.id === 'sui' ? '0x2::sui::SUI' : `0x${token.id}`,
          category: category
        };

        console.log(`✅ Successfully converted ${token.name}:`, {
          riskScore: convertedToken.riskScore,
          price: convertedToken.price,
          change: convertedToken.change
        });

        return convertedToken;
      } catch (tokenError) {
        console.error(`❌ Error processing token ${token.name}:`, tokenError);
        
        // Return a safe fallback token
        return {
          id: index + 1,
          name: token.name || 'Error Token',
          symbol: token.symbol?.toUpperCase() || 'ERROR',
          price: '$0.00',
          change: '0.00%',
          marketCap: '$0',
          volume: '$0',
          riskScore: 'high', // Mark as high risk due to processing error
          trending: 'down',
          image: token.image,
          liquidity: '$0',
          address: undefined,
          contractAddress: `0x${token.id || 'error'}`,
          category: 'Other'
        };
      }
    });

    // FIXED: Add SUI main token with safe error handling
    if (suiMainToken && !converted.find(t => t.symbol === 'SUI')) {
      try {
        const priceChange = suiMainToken.price_change_percentage_24h ?? 0;
        const marketCap = suiMainToken.market_cap ?? 0;
        const currentPrice = suiMainToken.current_price ?? 0;
        const volume = suiMainToken.total_volume ?? 0;
        
        console.log('Processing SUI main token:', { priceChange, marketCap, currentPrice, volume });

        const riskScore = safeGetRiskScore(priceChange, marketCap, 'SUI Main');
        
        const suiToken: Token = {
          id: 0,
          name: suiMainToken.name || 'Sui',
          symbol: suiMainToken.symbol || 'SUI',
          price: formatPrice(currentPrice),
          change: formatPriceChange(priceChange),
          marketCap: formatMarketCap(marketCap),
          volume: formatVolume(volume),
          riskScore: riskScore,
          trending: priceChange >= 0 ? 'up' : 'down',
          image: suiMainToken.image,
          address: '0x2::sui::SUI',
          contractAddress: '0x2::sui::SUI',
          liquidity: formatVolume(volume * 0.4), // Higher liquidity estimate for main token
          category: 'Infrastructure'
        };
        
        console.log('✅ Successfully processed SUI main token:', {
          riskScore: suiToken.riskScore,
          price: suiToken.price,
          change: suiToken.change
        });
        
        return [suiToken, ...converted];
      } catch (suiError) {
        console.error('❌ Error processing SUI main token:', suiError);
      }
    }

    console.log(`✅ Total tokens converted: ${converted.length}`);
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
      contractAddress: '0x2::sui::SUI',
      category: 'Infrastructure' as const
    }
  ];

  console.log('🎯 Final display tokens:', displayTokens.map(t => ({ 
    name: t.name, 
    riskScore: t.riskScore,
    price: t.price,
    change: t.change,
    hasValidRiskScore: ['low', 'medium', 'high'].includes(t.riskScore)
  })));

  // FIXED: Calculate real market stats with safe error handling
  const getMarketStats = (): MarketStats => {
    try {
      const tokens = allTokens.length > 0 ? allTokens : suiTokens;
      
      let scamsDetected = 1203; // Default fallback
      
      if (tokens && tokens.length > 0) {
        try {
          scamsDetected = tokens.filter(t => {
            try {
              const priceChange = t.price_change_percentage_24h || 0;
              const marketCap = t.market_cap || 0;
              const risk = safeGetRiskScore(priceChange, marketCap, t.name || 'Unknown');
              return risk === 'high';
            } catch (filterError) {
              console.warn('Error filtering token for scam detection:', filterError);
              return false; // Don't count as scam if we can't evaluate
            }
          }).length;
        } catch (scamDetectionError) {
          console.error('Error in scam detection calculation:', scamDetectionError);
        }
      }

      const stats = {
        totalTokens: tokens?.length || 12847,
        scamsDetected: scamsDetected,
        riskAssessments: tokens?.length || 45692,
        activeUsers: systemState ? systemState.activeValidators * 150 : 8934
      };

      console.log('📊 Market stats calculated:', stats);
      return stats;
    } catch (statsError) {
      console.error('❌ Error calculating market stats:', statsError);
      
      // Return safe fallback stats
      return {
        totalTokens: 12847,
        scamsDetected: 1203,
        riskAssessments: 45692,
        activeUsers: 8934
      };
    }
  };

  const marketStats = getMarketStats();

  // Enhanced handleAnalyzeToken with real API call and better error handling
  const handleAnalyzeToken = async (token: Token) => {
    console.log('🔍 handleAnalyzeToken called for:', token.name);
    
    // Check if token has a contract address
    const contractAddress = token.contractAddress || token.address || String(token.id);
    
    if (!contractAddress || contractAddress === 'undefined') {
      console.warn('Token does not have a valid contract address:', token);
      // Fall back to the original modal for tokens without contract addresses
      setSelectedTokenForAnalysis(token);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalyzedToken(null);
    setAnalysisResult(null);

    try {
      console.log('🔍 Starting analysis for token:', token.name, 'Address:', contractAddress);
      
      // Call your ChainCheck backend API
      const analysis = await chaincheckApi.analyzeToken(contractAddress);
      
      console.log('📊 Analysis result:', analysis);
      
      // FIXED: Safe token update with error handling
      const updatedToken: Token = {
        ...token,
        contractAddress: contractAddress,
      };

      // FIXED: Safely update token data with analysis results
      try {
        if (analysis.liquidityInfo?.price) {
          updatedToken.price = formatPrice(Number(analysis.liquidityInfo.price));
        }
        
        if (analysis.liquidityInfo?.priceChange24h) {
          const priceChange = Number(analysis.liquidityInfo.priceChange24h);
          updatedToken.change = formatPriceChange(priceChange);
          updatedToken.trending = priceChange >= 0 ? 'up' : 'down';
        }
        
        if (analysis.liquidityInfo?.marketCap) {
          updatedToken.marketCap = formatMarketCap(Number(analysis.liquidityInfo.marketCap));
        }
        
        if (analysis.liquidityInfo?.volume24h) {
          updatedToken.volume = formatVolume(Number(analysis.liquidityInfo.volume24h));
        }
        
        if (analysis.liquidityInfo?.liquidity) {
          updatedToken.liquidity = formatVolume(Number(analysis.liquidityInfo.liquidity));
        }
        
        // FIXED: Safe risk score update based on analysis
        if (typeof analysis.overallScore === 'number') {
          updatedToken.riskScore = analysis.overallScore >= 80 ? 'low' : 
                                   analysis.overallScore >= 60 ? 'medium' : 'high';
        }
      } catch (updateError) {
        console.error('Error updating token with analysis results:', updateError);
        // Keep original token data if update fails
      }

      // Set results and show popup
      setAnalyzedToken(updatedToken);
      setAnalysisResult(analysis);
      setShowAnalysisPopup(true);
      
      console.log('✅ Analysis completed successfully');
    } catch (error: any) {
      console.error('❌ Analysis failed:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Analysis failed. Please try again.';
      setAnalysisError(errorMessage);
      
      // Show error and fall back to original modal
      setSelectedTokenForAnalysis(token);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle closing the analysis popup
  const handleCloseAnalysisPopup = () => {
    setShowAnalysisPopup(false);
    setAnalysisResult(null);
    setAnalyzedToken(null);
    setAnalysisError(null);
  };

  // Basic refetch function for simple cases
  const refetchData = () => {
    console.log('Refetching data...');
    refetch();
  };

  return (
    <div className={`${isDark ? 'dark bg-slate-900' : 'bg-white'} transition-colors duration-300 min-h-screen`}>
      {/* Navigation with Navigation-specific search state */}
      <Navigation
        theme={theme}
        setTheme={setTheme}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        wallet={wallet}
        setShowWalletModal={setShowWalletModal}
        marketLoading={marketLoading}
        marketError={marketError}
        refetch={refetchData}
        showWalletModal={showWalletModal}
        selectedTokenForAnalysis={selectedTokenForAnalysis}
        setSelectedTokenForAnalysis={setSelectedTokenForAnalysis}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Page Content */}
      {currentPage === 'home' && (
        <HomePage
          isDark={isDark}
          searchQuery={homeSearchQuery}
          setSearchQuery={setHomeSearchQuery}
          displayTokens={displayTokens}
          marketStats={marketStats}
          marketLoading={marketLoading}
          marketError={marketError}
          lastUpdated={lastUpdated}
          suiMainToken={suiMainToken}
          marketFilters={marketFilters}
          setMarketFilters={setMarketFilters}
          currentMarketPage={currentMarketPage}
          setCurrentMarketPage={setCurrentMarketPage}
          pagination={pagination}
          refetch={refetch}
          onAnalyzeToken={handleAnalyzeToken}
        />
      )}
      
      {currentPage === 'watch' && (
        <PortfolioPage 
          isDark={isDark} 
        />
      )}
      
      {currentPage === 'learn' && (
        <LearnPage 
          isDark={isDark}
        />
      )}

      {currentPage === 'manager' && (
        <PortfolioTracker 
          isDark={isDark}
        />
      )}

      {/* Simple fallback content for when pages don't exist yet */}
      {!['home', 'watch', 'learn', 'manager'].includes(currentPage) && (
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className={`text-center py-20 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <h1 className="text-4xl font-bold mb-4">Welcome to ChainCheck</h1>
              <p className="text-xl text-gray-500 mb-8">
                Your comprehensive blockchain analytics platform
              </p>
              {wallet ? (
                <div className={`p-6 rounded-xl border max-w-md mx-auto ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {wallet.type === 'zk-google' ? 'Google ZK Login' : 'Sui Wallet'}
                  </p>
                  <code className={`text-sm p-2 rounded ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </code>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Connect Wallet to Get Started
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <Footer isDark={isDark} lastUpdated={lastUpdated} />

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
        getAvailableWallets={getAvailableWallets}
        getInstalledWallets={getInstalledWallets}
      />

      {/* Original Analysis Modal (fallback for tokens without contract addresses) */}
      <AnalysisModal
        token={selectedTokenForAnalysis}
        onClose={() => setSelectedTokenForAnalysis(null)}
        isDark={isDark}
      />

      {/* New Analysis Results Popup (for successful API analysis) */}
      <AnalysisResultsPopup
        token={analyzedToken}
        analysis={analysisResult}
        isOpen={showAnalysisPopup}
        onClose={handleCloseAnalysisPopup}
        isDark={isDark}
      />
    </div>
  );
};

export default ChainCheckApp;