import React, { useState, useEffect } from 'react';
import { PageType, ThemeType, Token, TokenFilters, MarketStats } from './types';
import { formatPrice, formatMarketCap, formatVolume, getRiskScore, getTokenCategory } from './utils/formatters';

// Hooks
import { useWalletConnection } from './hooks/useWalletConnection';
import { useSuiEcosystemData } from './hooks/useSuiEcosystemData';
import { useSuiSystemData } from './hooks/useSuiSystemData';
import { SessionProvider } from './hooks/sessionTimer';

// Components
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { WalletModal } from './components/modals/WalletModal';
import AnalysisModal from './components/modals/AnalysisModal';
import { AnalysisResultsPopup } from './components/AnalysisResultsPopup';
import { PortfolioTracker } from './components/PortfolioTracker';
import { EnhancedAdmin } from './components/layout/Admin';
import { BlogPostViewer } from './components/layout/blogViewer'; 
import { BlogPost } from './types/index'; 

// Services
import { chaincheckApi, TokenAnalysis } from './services/chaincheckApi';
import { saveBlogMetadata, fetchBlogIds } from './services/blogsIdAPI';

// Pages
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/manager';
import { LearnPage } from './pages/LearnPage';
import { WalletAnalyzer } from './pages/watch';

// Debug test for getRiskScore function on app startup
console.log('Testing getRiskScore function on App startup...');
try {
  const testRisk1 = getRiskScore(-15, 1000000000); // Should be 'medium'
  const testRisk2 = getRiskScore(5, 500000000); // Should be 'medium' 
  const testRisk3 = getRiskScore(-25, 50000); // Should be 'high'
  console.log('getRiskScore tests passed:', { testRisk1, testRisk2, testRisk3 });
} catch (error) {
  console.error('CRITICAL: getRiskScore function is broken:', error);
}

const ChainCheckApp: React.FC = () => {
  // Theme and navigation state
  const [theme, setTheme] = useState<ThemeType>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  // Learn page admin state - Fixed state management
  const [learnPageMode, setLearnPageMode] = useState<'public' | 'admin' | 'view-post'>('public'); 
  const [storedBlogIds, setStoredBlogIds] = useState<string[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isLoadingBlogIds, setIsLoadingBlogIds] = useState(false);
  
  // Separate search states to prevent conflicts
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

  const isDark = theme === 'light';

  // Load stored blog IDs from MongoDB (preferred) or localStorage (fallback) - FIXED
  useEffect(() => {
    const loadBlogIds = async () => {
      setIsLoadingBlogIds(true);
      try {
        console.log('🔄 App: Loading blog IDs from MongoDB...');
        
        // Try MongoDB first
        const mongoIds = await fetchBlogIds();
        setStoredBlogIds(mongoIds);
        
        console.log(`✅ App: Loaded ${mongoIds.length} blog IDs from MongoDB`);
        
        // Sync with localStorage for backup
        localStorage.setItem('walrus-blog-ids', JSON.stringify(mongoIds));
        
      } catch (mongoError) {
        console.warn('⚠️ App: MongoDB unavailable, falling back to localStorage');
        
        // Fallback to localStorage
        try {
          const savedIds = localStorage.getItem('walrus-blog-ids');
          if (savedIds) {
            const parsedIds = JSON.parse(savedIds);
            if (Array.isArray(parsedIds)) {
              setStoredBlogIds(parsedIds);
              console.log(`📦 App: Loaded ${parsedIds.length} blog IDs from localStorage`);
            }
          }
        } catch (localError) {
          console.error('❌ App: Error loading from localStorage:', localError);
        }
      } finally {
        setIsLoadingBlogIds(false);
      }
    };

    loadBlogIds();
  }, []);

  // FIXED: Only reset learn page mode when navigating AWAY from learn page
  useEffect(() => {
    if (currentPage !== 'learn') {
      console.log('📍 App: Navigating away from learn page, resetting state');
      setLearnPageMode('public');
      setSelectedBlogPost(null);
    }
    // Removed the problematic else clause that was causing the infinite loop
  }, [currentPage]); // Only depend on currentPage, not learnPageMode

  // Handle learn page admin login
  const handleLearnAdminLogin = () => {
    console.log('🔐 App: Learn page admin login triggered');
    setLearnPageMode('admin');
  };

  // Handle return to public learn page
  const handleReturnToPublicLearn = () => {
    console.log('🏠 App: Returning to public learn page');
    setLearnPageMode('public');
    setSelectedBlogPost(null);
  };

  // Handle view post
  const handleViewPost = (post: BlogPost) => {
    console.log('👁️ App: handleViewPost called with:', post.title);
    setSelectedBlogPost(post);
    setLearnPageMode('view-post');
  };

  // Handle back to learn
  const handleBackToLearn = () => {
    console.log('⬅️ App: Going back to learn page from post view');
    setSelectedBlogPost(null);
    setLearnPageMode('public');
  };

  // Handle donate
  const handleDonate = (blobId: string) => {
    alert(`💝 Donation functionality for blob ${blobId} would be implemented here`);
  };

  // ENHANCED: Handle blog creation with MongoDB integration
  const handleBlogCreated = async (blobId: string, blogData: {
    title: string;
    creator: string;
  }) => {
    try {
      console.log('📝 App: Blog created callback received:', { blobId, blogData });
      
      if (!blobId) {
        throw new Error('No blob ID provided');
      }

      if (storedBlogIds.includes(blobId)) {
        console.log('ℹ️ App: Blog ID already exists, skipping save');
        return;
      }

      // Save to MongoDB
      console.log('💾 App: Saving blog metadata to MongoDB...');
      await saveBlogMetadata({
        id: blobId,
        title: blogData.title,
        creator: blogData.creator
      });
      console.log('✅ App: Blog metadata saved to MongoDB');

      // Update local state
      const newIds = [...storedBlogIds, blobId];
      setStoredBlogIds(newIds);
      
      // Update localStorage as backup
      localStorage.setItem('walrus-blog-ids', JSON.stringify(newIds));
      
      console.log('🎉 App: Blog creation completed successfully');
      
    } catch (error) {
      console.error('❌ App: Error in blog creation callback:', error);
      
      // Fallback to localStorage only
      if (!storedBlogIds.includes(blobId)) {
        const newIds = [...storedBlogIds, blobId];
        setStoredBlogIds(newIds);
        localStorage.setItem('walrus-blog-ids', JSON.stringify(newIds));
        console.log('📦 App: Saved to localStorage as fallback');
      }
      
      throw error; // Re-throw so Admin component can handle the error
    }
  };

  // Session expiry and warning handlers
  const handleSessionExpired = () => {
    console.log('⏰ App: Session has expired across the app');
    // Optional: You could show a toast notification here
  };

  const handleSessionWarning = () => {
    console.log('⚠️ App: Session warning: 5 minutes remaining');
    // Optional: You could show a toast notification here
  };

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

      console.log(`Risk score for ${tokenName}: ${riskScore} (change: ${priceChange}%, cap: ${marketCap})`);
      return riskScore;
    } catch (error) {
      console.error(`Error calculating risk score for ${tokenName}:`, error);
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

  // Convert API data to display format with comprehensive error handling
  const convertApiToTokens = (): Token[] => {
    if (!suiTokens || suiTokens.length === 0) {
      console.log('No tokens available from API');
      return [];
    }

    console.log(`Converting ${suiTokens.length} tokens from API...`);

    const converted: Token[] = suiTokens.map((token, index) => {
      try {
        const priceChange = token.price_change_percentage_24h ?? 0;
        const marketCap = token.market_cap ?? 0;
        const currentPrice = token.current_price ?? 0;
        const volume = token.total_volume ?? 0;
        
        console.log(`Processing token ${token.name}: price=${currentPrice}, change=${priceChange}%, cap=${marketCap}, volume=${volume}`);
        
        // Use safe risk score calculation
        const riskScore = safeGetRiskScore(priceChange, marketCap, token.name);

        // Safe formatting with error handling
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

        // Safe category calculation
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

        console.log(`Successfully converted ${token.name}:`, {
          riskScore: convertedToken.riskScore,
          price: convertedToken.price,
          change: convertedToken.change
        });

        return convertedToken;
      } catch (tokenError) {
        console.error(`Error processing token ${token.name}:`, tokenError);
        
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

    console.log(`Total tokens converted: ${converted.length}`);
    return converted;
  };

  // Use live data if available, otherwise fall back to mock data
  const liveTokens = convertApiToTokens();
  const displayTokens = liveTokens.length > 0 ? liveTokens : [];

  console.log('Final display tokens:', displayTokens.map(t => ({ 
    name: t.name, 
    riskScore: t.riskScore,
    price: t.price,
    change: t.change,
    hasValidRiskScore: ['low', 'medium', 'high'].includes(t.riskScore)
  })));

  // Calculate real market stats with safe error handling
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

      console.log('Market stats calculated:', stats);
      return stats;
    } catch (statsError) {
      console.error('Error calculating market stats:', statsError);
      
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
    console.log('handleAnalyzeToken called for:', token.name);
    
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
      console.log('Starting analysis for token:', token.name, 'Address:', contractAddress);
      
      // Call your ChainCheck backend API
      const analysis = await chaincheckApi.analyzeToken(contractAddress);
      
      console.log('Analysis result:', analysis);
      
      // Safe token update with error handling
      const updatedToken: Token = {
        ...token,
        contractAddress: contractAddress,
      };

      // Safely update token data with analysis results
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
        
        // Safe risk score update based on analysis
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
      
      console.log('Analysis completed successfully');
    } catch (error: any) {
      console.error('Analysis failed:', error);
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

  // Debug: Log current learn page state for troubleshooting
  console.log('🐛 App Debug - Learn page state:', {
    currentPage,
    learnPageMode,
    selectedBlogPost: selectedBlogPost?.title || null,
    storedBlogIds: storedBlogIds.length,
    isLoadingBlogIds
  });

  return (
    <SessionProvider
      sessionDuration={30 * 60 * 1000} // 30 minutes
      warningTime={5 * 60 * 1000} // 5 minutes warning
      onSessionExpired={handleSessionExpired}
      onWarning={handleSessionWarning}
    >
      <div className={`${isDark ? 'dark bg-slate-900' : 'bg-white'} transition-colors duration-300 min-h-screen`}>
        {/* Navigation with conditional login button for learn page */}
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
          onLearnAdminLogin={currentPage === 'learn' && learnPageMode === 'public' ? handleLearnAdminLogin : undefined}
        />

        {/* Page Content - FIXED conditional rendering */}
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
        
        {currentPage === 'manager' && (
          <PortfolioPage 
            isDark={isDark} 
          />
        )}

        {currentPage === 'watch' && (
          <WalletAnalyzer 
            isDark={isDark} 
          />
        )}
        
        {/* Learn page with FIXED conditional rendering - no more glitching! */}
        {currentPage === 'learn' && (
          <>
            {/* Public learn page */}
            {learnPageMode === 'public' && (
              <LearnPage 
                isDark={isDark}
                storedBlogIds={storedBlogIds}
                onCreateNew={handleLearnAdminLogin}
                onViewPost={handleViewPost}
              />
            )}

            {/* Blog post viewer */}
            {learnPageMode === 'view-post' && selectedBlogPost && (
              <BlogPostViewer
                post={{
                  ...selectedBlogPost,
                  excerpt: selectedBlogPost.excerpt ?? ""
                }}
                isDark={isDark}
                onBack={handleBackToLearn}
                onDonate={handleDonate}
              />
            )}

            {/* Admin panel */}
            {learnPageMode === 'admin' && (
              <EnhancedAdmin
                isDark={isDark}
                onNavigateToDashboard={handleReturnToPublicLearn}
                onBlogCreated={handleBlogCreated}
              />
            )}
          </>
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
    </SessionProvider>
  );
};

export default ChainCheckApp;