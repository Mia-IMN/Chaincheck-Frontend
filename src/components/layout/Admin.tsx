import React, { useState, useEffect } from 'react';
import { BlogCreator } from './blogCreator';
import { LearnPage } from '../../pages/LearnPage';
import { BlogPostViewer } from './blogViewer';
import { deleteBlogPost, downloadBlogPost } from './dataDownload';
import { fetchBlogIds, deleteBlogMetadata } from '../../services/blogsIdAPI';

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: string;
  content: string;
  image?: string;
  acceptDonation?: boolean;
  blobId?: string;
}

interface EnhancedAdminProps {
  isDark: boolean;
  onNavigateToDashboard?: () => void;
  onBlogCreated?: (blobId: string, blogData: {
    title: string;
    creator: string;
  }) => Promise<void>; // New callback for MongoDB integration
}

type ViewMode = 'dashboard' | 'create' | 'view-post' | 'manage';

export const EnhancedAdmin: React.FC<EnhancedAdminProps> = ({ 
  isDark, 
  onNavigateToDashboard,
  onBlogCreated 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [storedBlogIds, setStoredBlogIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isConnectedToMongoDB, setIsConnectedToMongoDB] = useState(false);

  // Load blog IDs from MongoDB (preferred) or localStorage (fallback)
  useEffect(() => {
    const loadBlogIds = async () => {
      try {
        console.log('🔄 Admin: Loading blog IDs from MongoDB...');
        
        // Try to fetch from MongoDB first
        const mongoIds = await fetchBlogIds();
        setStoredBlogIds(mongoIds);
        setIsConnectedToMongoDB(true);
        
        console.log(`✅ Admin: Loaded ${mongoIds.length} blog IDs from MongoDB`);
        
        // Sync with localStorage for backup
        localStorage.setItem('walrus-blog-ids', JSON.stringify(mongoIds));
        
      } catch (mongoError) {
        console.warn('⚠️ Admin: MongoDB unavailable, falling back to localStorage');
        setIsConnectedToMongoDB(false);
        
        // Fallback to localStorage
        try {
          const savedIds = localStorage.getItem('walrus-blog-ids');
          if (savedIds) {
            const parsedIds = JSON.parse(savedIds);
            if (Array.isArray(parsedIds)) {
              setStoredBlogIds(parsedIds);
              console.log(`📦 Admin: Loaded ${parsedIds.length} blog IDs from localStorage`);
            }
          }
        } catch (localError) {
          console.error('❌ Admin: Error loading from localStorage:', localError);
          setError('Failed to load stored blog posts');
        }
      }
    };

    loadBlogIds();
  }, []);

  // Save blog IDs to both MongoDB (preferred) and localStorage (backup)
  const saveBlogIds = (ids: string[]) => {
    try {
      // Always update localStorage as backup
      localStorage.setItem('walrus-blog-ids', JSON.stringify(ids));
      setStoredBlogIds(ids);
      console.log('📦 Admin: Saved blog IDs to localStorage as backup');
    } catch (err) {
      console.error('❌ Admin: Error saving blog IDs to localStorage:', err);
      setError('Failed to save blog post IDs to local storage');
    }
  };

  // Fetch all blog posts for management
  const fetchAllPosts = async () => {
    setLoading(true);
    setError(null);
    const posts: BlogPost[] = [];
    
    try {
      console.log(`🔍 Admin: Fetching ${storedBlogIds.length} blog posts from Walrus...`);
      
      for (const blobId of storedBlogIds) {
        try {
          const post = await downloadBlogPost(blobId);
          if (post) {
            posts.push({ ...post, blobId });
            console.log(`✅ Admin: Loaded post: ${post.title}`);
          }
        } catch (error) {
          console.error(`❌ Admin: Failed to fetch post ${blobId}:`, error);
          // Create placeholder entry for failed posts
          posts.push({
            title: `Failed to load post (${blobId.substring(0, 8)}...)`,
            excerpt: 'Content temporarily unavailable from Walrus network',
            category: 'Unknown',
            readTime: 'Unknown',
            publishedAt: new Date().toISOString(),
            author: 'Unknown',
            content: 'Failed to load content',
            blobId
          });
        }
      }
      
      // Sort by publish date (newest first)
      posts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      setBlogPosts(posts);
      console.log(`✅ Admin: Successfully loaded ${posts.length} blog posts`);
    } catch (err) {
      console.error('❌ Admin: Error fetching posts:', err);
      setError('Failed to fetch blog posts from Walrus network');
    } finally {
      setLoading(false);
    }
  };

  // Load posts when blogIds change
  useEffect(() => {
    if (storedBlogIds.length > 0) {
      fetchAllPosts();
    } else {
      setBlogPosts([]);
    }
  }, [storedBlogIds]);

  // Handle new blog published with MongoDB integration
  const handleBlogPublished = async (blobId: string, blogMetadata?: {
    title: string;
    author: string;
  }) => {
    try {
      console.log('🎉 Admin: Blog published to Walrus:', { blobId, blogMetadata });
      
      if (!blobId) {
        throw new Error('No blob ID provided');
      }

      if (storedBlogIds.includes(blobId)) {
        console.log('ℹ️ Admin: Blog ID already exists, skipping save');
        setViewMode('dashboard');
        return;
      }

      // If MongoDB integration is available and metadata is provided
      if (onBlogCreated && blogMetadata && isConnectedToMongoDB) {
        console.log('💾 Admin: Saving to MongoDB via BlogApp...');
        
        await onBlogCreated(blobId, {
          title: blogMetadata.title,
          creator: blogMetadata.author
        });
        
        console.log('✅ Admin: Blog metadata saved to MongoDB');
      } else {
        console.log('📦 Admin: Using localStorage fallback');
        
        // Fallback to localStorage
        const newIds = [...storedBlogIds, blobId];
        saveBlogIds(newIds);
      }
      
      // Update local state for immediate UI feedback
      if (!storedBlogIds.includes(blobId)) {
        setStoredBlogIds(prev => [...prev, blobId]);
      }
      
      setViewMode('dashboard');
      
      // Show success message with connection status
      const storageMethod = isConnectedToMongoDB ? 'database and' : 'local';
      alert(`🎉 Blog published successfully!\n\n✅ Uploaded to Walrus network\n✅ Saved to ${storageMethod} storage`);
      
    } catch (error) {
      console.error('❌ Admin: Error saving blog:', error);
      
      // Try localStorage fallback on MongoDB error
      if (isConnectedToMongoDB && error) {
        console.log('🔄 Admin: MongoDB failed, trying localStorage fallback...');
        try {
          const newIds = [...storedBlogIds, blobId];
          saveBlogIds(newIds);
          setViewMode('dashboard');
          alert('⚠️ Blog published to Walrus but saved locally only.\nDatabase connection issue detected.');
        } catch (fallbackError) {
          setError('Blog was published to Walrus but failed to save metadata. Please note the blob ID.');
          alert(`❌ Blog published to Walrus but failed to save.\nBlob ID: ${blobId}\nPlease save this ID manually.`);
        }
      } else {
        setError('Failed to save blog metadata. Please try again.');
        alert('❌ Blog publication failed. Please try again.');
      }
    }
  };

  // Handle blog deletion with MongoDB integration
  const handleDeleteBlog = async (blobId: string) => {
    if (!blobId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this blog post?\n\n' +
      '⚠️ This will:\n' +
      '• Remove from database\n' +
      '• Remove from local storage\n' +
      '• Walrus content will remain (cannot be deleted)\n\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      console.log(`🗑️ Admin: Deleting blog ${blobId}...`);
      
      let mongoDeleted = false;
      let walrusDeleted = false;
      
      // Try to delete from MongoDB first
      if (isConnectedToMongoDB) {
        try {
          mongoDeleted = await deleteBlogMetadata(blobId);
          console.log(`${mongoDeleted ? '✅' : '❌'} Admin: MongoDB deletion result: ${mongoDeleted}`);
        } catch (error) {
          console.error('❌ Admin: MongoDB deletion failed:', error);
        }
      }
      
      // Try to delete from Walrus (note: this may not work as Walrus deletion isn't always supported)
      try {
        walrusDeleted = await deleteBlogPost(blobId);
        console.log(`${walrusDeleted ? '✅' : '❌'} Admin: Walrus deletion result: ${walrusDeleted}`);
      } catch (error) {
        console.error('⚠️ Admin: Walrus deletion failed (expected):', error);
      }
      
      // Remove from local state and localStorage
      const newIds = storedBlogIds.filter(id => id !== blobId);
      saveBlogIds(newIds);
      setBlogPosts(blogPosts.filter(post => post.blobId !== blobId));
      
      // Show appropriate success message
      if (mongoDeleted || !isConnectedToMongoDB) {
        alert(
          '✅ Blog post deleted successfully!\n\n' +
          `${mongoDeleted ? '✅ Removed from database\n' : ''}` +
          '✅ Removed from local storage\n' +
          `${walrusDeleted ? '✅ Removed from Walrus\n' : '⚠️ Walrus content remains (cannot be deleted)\n'}`
        );
      } else {
        alert('⚠️ Blog removed locally but may still exist in database.\nPlease refresh and try again.');
      }
      
    } catch (error) {
      console.error('❌ Admin: Error deleting blog:', error);
      alert('❌ An error occurred while deleting the blog post.\nPlease try again.');
    }
  };

  // Handle post view
  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setViewMode('view-post');
  };

  // Handle donation (placeholder)
  const handleDonate = (blobId: string) => {
    alert(`💝 Donation functionality for blob ${blobId} would be implemented here`);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      'Security': isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800',
      'Infrastructure': isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800',
      'Analytics': isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800',
      'Risk Management': isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-800',
      'Research': isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
    };
    return styles[category] || (isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="mb-4 sm:mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm sm:text-base">{message}</span>
      </div>
      <button 
        onClick={() => setError(null)}
        className="mt-2 text-sm underline hover:no-underline"
      >
        Dismiss
      </button>
    </div>
  );

  // Connection Status Component
  const ConnectionStatus = () => (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
      isConnectedToMongoDB
        ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
        : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnectedToMongoDB ? 'bg-green-500' : 'bg-yellow-500'
      }`}></div>
      {isConnectedToMongoDB ? 'Connected to Database' : 'Using Local Storage'}
    </div>
  );

  // Mobile Post Card Component
  const MobilePostCard = ({ post, index }: { post: BlogPost; index: number }) => (
    <div
      key={post.blobId || index}
      className={`p-4 rounded-xl border transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-white border-gray-200 hover:shadow-md'
      } ${post.content === 'Failed to load content' ? 'border-yellow-500/50' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(post.category)}`}>
              {post.category}
            </span>
            {post.acceptDonation && (
              <span className="text-xs">💝</span>
            )}
            {post.content === 'Failed to load content' && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
              }`}>
                Failed to load
              </span>
            )}
          </div>
          
          <h3 className={`text-base font-bold mb-2 line-clamp-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {post.title || 'Untitled Post'}
          </h3>
          
          <p className={`text-sm mb-3 line-clamp-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {post.excerpt || 'No excerpt available'}
          </p>
          
          <div className={`flex flex-wrap items-center gap-2 text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>By {post.author || 'Unknown'}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.readTime || 'Unknown read time'}</span>
          </div>
          
          <div className={`mt-2 text-xs font-mono ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            ID: {post.blobId?.substring(0, 8) || 'No ID'}...
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-3">
          <button
            onClick={() => handleViewPost(post)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="View post"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          <button
            onClick={() => handleDeleteBlog(post.blobId!)}
            className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/10"
            title="Delete post"
            disabled={!post.blobId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // Render based on current view mode
  if (viewMode === 'create') {
    return (
      <BlogCreator
        isDark={isDark}
        onPublish={handleBlogPublished} // Updated to handle metadata
        onCancel={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'view-post' && selectedPost) {
    return (
      <BlogPostViewer
        post={selectedPost}
        isDark={isDark}
        onBack={() => setViewMode('dashboard')}
        onDonate={handleDonate}
      />
    );
  }

  if (viewMode === 'manage') {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-24">
          {/* Mobile-friendly Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Manage Blog Posts
                </h1>
                <ConnectionStatus />
              </div>
            </div>
            
            <button
              onClick={fetchAllPosts}
              disabled={loading}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] hover:shadow-lg hover:shadow-blue-500/25'
              } text-white`}
            >
              {loading ? 'Loading...' : 'Refresh Posts'}
            </button>
          </div>

          {/* Error Display */}
          {error && <ErrorDisplay message={error} />}

          {/* Stats - Mobile-friendly grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className={`p-4 sm:p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {storedBlogIds.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Posts
              </div>
            </div>
            <div className={`p-4 sm:p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {blogPosts.filter(post => post.acceptDonation).length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Accept Donations
              </div>
            </div>
            <div className={`p-4 sm:p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Set(blogPosts.map(post => post.category)).size}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Categories
              </div>
            </div>
          </div>

          {/* Posts list */}
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 ${
                isDark ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
              <p className={`mt-4 text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-600'}`}>
                Loading blog posts from Walrus network...
              </p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className={`text-4xl sm:text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                📝
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                No posts to manage
              </h3>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {storedBlogIds.length === 0 
                  ? 'Create some blog posts to see them here.'
                  : 'Unable to load blog posts. Try refreshing.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="sm:hidden space-y-4">
                {blogPosts.map((post, index) => (
                  <MobilePostCard key={post.blobId || index} post={post} index={index} />
                ))}
              </div>

              {/* Desktop view - List */}
              <div className="hidden sm:block space-y-4">
                {blogPosts.map((post, index) => (
                  <div
                    key={post.blobId || index}
                    className={`p-6 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-white border-gray-200 hover:shadow-md'
                    } ${post.content === 'Failed to load content' ? 'border-yellow-500/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(post.category)}`}>
                            {post.category}
                          </span>
                          {post.acceptDonation && (
                            <span className="text-sm">💝 Donations</span>
                          )}
                          {post.content === 'Failed to load content' && (
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              ⚠️ Failed to load
                            </span>
                          )}
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {post.title || 'Untitled Post'}
                        </h3>
                        
                        <p className={`text-sm mb-3 line-clamp-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {post.excerpt || 'No excerpt available'}
                        </p>
                        
                        <div className={`flex items-center gap-4 text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>By {post.author || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>•</span>
                          <span>{post.readTime || 'Unknown read time'}</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{post.blobId?.substring(0, 8) || 'No ID'}...</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewPost(post)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="View post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBlog(post.blobId!)}
                          className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/10"
                          title="Delete post"
                          disabled={!post.blobId}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default dashboard view - Mobile-first
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-24">
        {/* Mobile-friendly Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className={`text-2xl sm:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Blog Management Dashboard
              </h1>
              <ConnectionStatus />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                isDark 
                  ? 'border border-white/20 text-white hover:bg-white/5' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Manage Posts ({storedBlogIds.length})
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base"
            >
              Create New Post
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorDisplay message={error} />}

        {/* Stats Cards - Mobile-friendly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`p-4 sm:p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-lg ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                📝
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {storedBlogIds.length}
                </div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Published Posts
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-lg ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                ☁️
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Walrus
                </div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Storage Network
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-lg ${
                isConnectedToMongoDB
                  ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {isConnectedToMongoDB ? '🔗' : '📦'}
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isConnectedToMongoDB ? 'Online' : 'Local'}
                </div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Storage Mode
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-lg ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                🔒
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Secure
                </div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Decentralized
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};