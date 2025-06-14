import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { downloadBlogPost } from '../components/layout/dataDownload';
import { BlogPost } from '../types/index';
import { BlogMetadata } from '../services/blogsIdAPI';

interface LearnPageProps {
  isDark: boolean;
  storedBlogIds?: string[]; 
  blogMetadata?: BlogMetadata[]; // New prop for better performance
  onCreateNew?: () => void; 
  onViewPost?: (post: BlogPost) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ 
  isDark, 
  storedBlogIds = [], 
  blogMetadata = [],
  onCreateNew,
  onViewPost 
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Track retries to prevent infinite loops

  const categories = ['All', 'Security', 'Infrastructure', 'Analytics', 'Risk Management', 'Research'];

  // Memoize metadata map to prevent unnecessary recalculations
  const metadataMap = useMemo(() => {
    return new Map(blogMetadata.map(meta => [meta.id, meta]));
  }, [blogMetadata]);

  // Memoize blog IDs string to prevent unnecessary effect triggers
  const blogIdsString = useMemo(() => {
    return storedBlogIds.join(',');
  }, [storedBlogIds]);

  const getCategoryStyle = (category: string) => {
    const styles = {
      'Security': 'bg-red-100 text-red-800',
      'Infrastructure': 'bg-blue-100 text-blue-800', 
      'Analytics': 'bg-green-100 text-green-800',
      'Risk Management': 'bg-orange-100 text-orange-800',
      'Research': 'bg-purple-100 text-purple-800'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getDarkCategoryStyle = (category: string) => {
    const styles = {
      'Security': 'bg-red-500/20 text-red-400',
      'Infrastructure': 'bg-blue-500/20 text-blue-400',
      'Analytics': 'bg-green-500/20 text-green-400', 
      'Risk Management': 'bg-orange-500/20 text-orange-400',
      'Research': 'bg-purple-500/20 text-purple-400'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-500/20 text-gray-400';
  };

  // FIXED: Wrap fetchPosts in useCallback with proper dependencies
  const fetchPosts = useCallback(async () => {
    // Prevent infinite loops with retry limit
    if (retryCount > 3) {
      console.warn('⚠️ LearnPage: Max retry limit reached, stopping fetch attempts');
      setLoading(false);
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    console.log('📚 LearnPage: Fetching blog posts... (attempt #' + (retryCount + 1) + ')');
    console.log('📋 Available blog IDs:', storedBlogIds);
    console.log('📊 Available metadata entries:', metadataMap.size);
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedPosts: BlogPost[] = [];
      
      for (const blobId of storedBlogIds) {
        try {
          console.log(`🔍 Fetching post content for: ${blobId}`);
          
          // Get full post content from Walrus
          const post = await downloadBlogPost(blobId);
          if (post) {
            // Enhance with metadata from MongoDB if available
            const metadata = metadataMap.get(blobId);
            if (metadata) {
              console.log(`📈 Enhancing post with MongoDB metadata:`, metadata);
              // Use MongoDB data as authoritative for basic info
              post.blobId = blobId;
              post.title = post.title || metadata.title;
              post.author = post.author || metadata.creator;
              post.publishedAt = post.publishedAt || metadata.createdAt;
            } else {
              post.blobId = blobId;
            }
            
            fetchedPosts.push(post);
            console.log(`✅ Post loaded: ${post.title}`);
          }
        } catch (err) {
          console.error(`❌ Failed to fetch post ${blobId}:`, err);
          
          // If we have metadata but failed to get content, show partial info
          const metadata = metadataMap.get(blobId);
          if (metadata) {
            console.log(`📋 Using metadata fallback for: ${blobId}`);
            fetchedPosts.push({
              blobId,
              title: metadata.title,
              author: metadata.creator,
              publishedAt: metadata.createdAt?.toString() || new Date().toISOString(),
              excerpt: 'Content temporarily unavailable. Click to retry loading.',
              content: 'Failed to load content from Walrus. Please try again.',
              category: 'General',
              readTime: 'Unknown',
              acceptDonation: false
            });
          }
        }
      }
      
      // Sort by publish date (newest first)
      fetchedPosts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      console.log(`✅ LearnPage: Loaded ${fetchedPosts.length} posts total`);
      setPosts(fetchedPosts);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (err) {
      console.error('❌ LearnPage: Error fetching posts:', err);
      setError('Failed to load blog posts');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [storedBlogIds, metadataMap, retryCount]); // Fixed dependencies

  // FIXED: Use blogIdsString instead of storedBlogIds array to prevent unnecessary triggers
  useEffect(() => {
    console.log('🔄 LearnPage: useEffect triggered');
    console.log('📊 Blog IDs string:', blogIdsString);
    console.log('📊 Metadata map size:', metadataMap.size);
    
    if (storedBlogIds.length > 0) {
      fetchPosts();
    } else {
      console.log('ℹ️ LearnPage: No blog IDs available');
      setPosts([]);
      setLoading(false);
      setRetryCount(0); // Reset retry count when no IDs
    }
  }, [blogIdsString, metadataMap.size]); // Use stable values instead of arrays

  const filteredPosts = useMemo(() => {
    return selectedCategory === 'All' 
      ? posts 
      : posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  // FIXED: Prevent fetchPosts from being called in handlePostClick to avoid loops
  const handlePostClick = useCallback((post: BlogPost, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('📖 LearnPage: Post clicked:', post.title);
    
    // If content failed to load, increment retry count instead of calling fetchPosts
    if (post.content.includes('Failed to load content')) {
      console.log('🔄 Retrying failed post load...');
      // Instead of calling fetchPosts(), just increment retry count
      // The useEffect will handle the re-fetch
      setRetryCount(prev => prev + 1);
      return;
    }
    
    if (onViewPost) {
      onViewPost(post);
    } else {
      console.warn('⚠️ onViewPost function not provided to LearnPage');
    }
  }, [onViewPost]);

  // Manual retry function that resets retry count
  const handleManualRetry = useCallback(() => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(0);
    setError(null);
    fetchPosts();
  }, [fetchPosts]);

  // Show connection status in loading state
  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0B1120]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
            <p className={`mt-4 text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-600'}`}>
              Loading posts from Walrus network...
            </p>
            <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {storedBlogIds.length} posts found in database
            </p>
            {retryCount > 0 && (
              <p className={`mt-1 text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Retry attempt #{retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors py-10 duration-200 ${isDark ? 'bg-[#0B1120]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Mobile-first header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className={`text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Community Intelligence Hub
          </h1>
          <p className={`text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Professional insights, research papers, and analysis from leading blockchain experts and institutional researchers
          </p>
          
          {/* Database connection indicator */}
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            storedBlogIds.length > 0 
              ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
              : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              storedBlogIds.length > 0 ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            {storedBlogIds.length > 0 
              ? `${storedBlogIds.length} posts in database`
              : 'No posts in database'
            }
          </div>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button 
              onClick={handleManualRetry}
              className="mt-2 text-sm underline hover:no-underline"
              disabled={retryCount > 3}
            >
              {retryCount > 3 ? 'Max retries reached' : 'Retry loading from Walrus'}
            </button>
          </div>
        )}

        {/* Mobile filter toggle */}
        <div className="sm:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <span className="font-medium">
              Filter: {selectedCategory}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Category filters */}
        <div className={`mb-8 sm:mb-12 ${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
          <div className={`grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center p-4 sm:p-0 rounded-xl ${
            showMobileFilters && !isDark ? 'bg-gray-50' : ''
          } ${showMobileFilters && isDark ? 'bg-white/5' : ''} sm:bg-transparent`}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowMobileFilters(false);
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            {/* <div className={`text-4xl sm:text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>📝</div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No posts found
            </h3>
            <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedCategory === 'All' 
                ? 'No blog posts have been published yet. Check back soon for new content!'
                : `No posts found in the ${selectedCategory} category. Try browsing other categories.`}
            </p>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base"
              >
                Create Your First Post
              </button>
            )} */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.blobId || index}
                className={`group cursor-pointer rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20' 
                    : 'bg-white border border-slate-200 hover:shadow-slate-200/50 hover:border-slate-300'
                } ${post.content.includes('Failed to load') ? 'border-yellow-500/50' : ''}`}
                onClick={(e) => handlePostClick(post, e)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePostClick(post, e as any);
                  }
                }}
              >
                {post.image && (
                  <div className="mb-3 sm:mb-4 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-32 sm:h-48 object-cover rounded-t-2xl"
                    />
                  </div>
                )}

                <div className="mb-2 sm:mb-3">
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    isDark ? getDarkCategoryStyle(post.category) : getCategoryStyle(post.category)
                  }`}>
                    {post.category}
                  </span>
                  
                  {/* Show status indicator for failed loads */}
                  {post.content.includes('Failed to load') && (
                    <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs ${
                      isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Click to retry
                    </span>
                  )}
                </div>
                
                <h2 className={`text-base sm:text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {post.title}
                </h2>
                
                <p className={`text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {post.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {post.author?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {post.author}
                    </span>
                  </div>
                  
                  <div className={`text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div>{post.readTime}</div>
                    <div>{formatDate(post.publishedAt)}</div>
                  </div>
                </div>

                {/* Visual indicator that post is clickable */}
                <div className={`mt-3 sm:mt-4 text-center text-xs sm:text-sm transition-opacity opacity-0 group-hover:opacity-100 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {post.content.includes('Failed to load') ? 'Click to retry loading →' : 'Click to read more →'}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Newsletter signup - Mobile-optimized */}
        <div className={`mt-12 sm:mt-20 text-center p-6 sm:p-12 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
        }`}>
          <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Professional Research Updates
          </h3>
          
          <p className={`text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Get exclusive access to institutional-grade research, market intelligence, and technical analysis from our team of experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-4 sm:px-6 py-3 rounded-xl border transition-all text-sm sm:text-base ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-blue-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            <button className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 text-sm sm:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};