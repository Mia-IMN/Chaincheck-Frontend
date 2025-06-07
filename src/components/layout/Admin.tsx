import React, { useState, useEffect } from 'react';

// Import the components - adjust these paths to match your file structure
import { BlogCreator } from './blogCreator';
import { LearnPage } from '../../pages/LearnPage';
import { BlogPostViewer } from './blogViewer';
import { deleteBlogPost, downloadBlogPost } from './dataDownload';

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
}

type ViewMode = 'dashboard' | 'create' | 'view-post' | 'manage';

export const EnhancedAdmin: React.FC<EnhancedAdminProps> = ({ 
  isDark, 
  onNavigateToDashboard 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [storedBlogIds, setStoredBlogIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored blog IDs from localStorage
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('walrus-blog-ids');
      if (savedIds) {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          setStoredBlogIds(parsedIds);
        }
      }
    } catch (err) {
      console.error('Error loading blog IDs from localStorage:', err);
      setError('Failed to load stored blog posts');
    }
  }, []);

  // Save blog IDs to localStorage
  const saveBlogIds = (ids: string[]) => {
    try {
      localStorage.setItem('walrus-blog-ids', JSON.stringify(ids));
      setStoredBlogIds(ids);
    } catch (err) {
      console.error('Error saving blog IDs to localStorage:', err);
      setError('Failed to save blog post IDs');
    }
  };

  // Fetch all blog posts for management
  const fetchAllPosts = async () => {
    setLoading(true);
    setError(null);
    const posts: BlogPost[] = [];
    
    try {
      for (const blobId of storedBlogIds) {
        try {
          const post = await downloadBlogPost(blobId);
          if (post) {
            posts.push({ ...post, blobId });
          }
        } catch (error) {
          console.error(`Failed to fetch post ${blobId}:`, error);
        }
      }
      
      // Sort posts by publish date (newest first)
      posts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      setBlogPosts(posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch blog posts');
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

  // Handle new blog published
  const handleBlogPublished = (blobId: string) => {
    if (blobId && !storedBlogIds.includes(blobId)) {
      const newIds = [...storedBlogIds, blobId];
      saveBlogIds(newIds);
      setViewMode('dashboard');
    }
  };

  // Handle blog deletion
  const handleDeleteBlog = async (blobId: string) => {
    if (!blobId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const success = await deleteBlogPost(blobId);
      if (success) {
        const newIds = storedBlogIds.filter(id => id !== blobId);
        saveBlogIds(newIds);
        setBlogPosts(blogPosts.filter(post => post.blobId !== blobId));
        alert('Blog post deleted successfully');
      } else {
        alert('Failed to delete blog post from Walrus');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('An error occurred while deleting the blog post');
    }
  };

  // Handle post view
  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setViewMode('view-post');
  };

  // Handle donation (placeholder)
  const handleDonate = (blobId: string) => {
    alert(`Donation functionality for blob ${blobId} would be implemented here`);
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
    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
      <button 
        onClick={() => setError(null)}
        className="mt-2 text-sm underline hover:no-underline"
      >
        Dismiss
      </button>
    </div>
  );

  // Render based on current view mode
  if (viewMode === 'create') {
    return (
      <BlogCreator
        isDark={isDark}
        onPublish={handleBlogPublished}
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
        <div className="max-w-7xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Manage Blog Posts
              </h1>
            </div>
            
            <button
              onClick={fetchAllPosts}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {storedBlogIds.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Posts
              </div>
            </div>
            <div className={`p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {blogPosts.filter(post => post.acceptDonation).length}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Accept Donations
              </div>
            </div>
            <div className={`p-6 rounded-xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Set(blogPosts.map(post => post.category)).size}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Categories
              </div>
            </div>
          </div>

          {/* Posts list */}
          {loading ? (
            <div className="text-center py-16">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
                isDark ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
              <p className={`mt-4 ${isDark ? 'text-white' : 'text-gray-600'}`}>
                Loading blog posts...
              </p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className={`text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                📝
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                No posts to manage
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {storedBlogIds.length === 0 
                  ? 'Create some blog posts to see them here.'
                  : 'Unable to load blog posts. Try refreshing.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post, index) => (
                <div
                  key={post.blobId || index}
                  className={`p-6 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
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
          )}
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Blog Management Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('manage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'border border-white/20 text-white hover:bg-white/5' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Manage Posts ({storedBlogIds.length})
            </button>
            <button
              onClick={() => setViewMode('create')}
              className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Create New Post
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorDisplay message={error} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                📝
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {storedBlogIds.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Published Posts
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                ☁️
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Walrus
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Storage Network
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                👀
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Live
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Blog Status
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
              }`}>
                🔒
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Secure
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Decentralized
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog display */}
        {/* <LearnPage
          isDark={isDark}
          storedBlogIds={storedBlogIds}
          onCreateNew={() => setViewMode('create')}
          onViewPost={handleViewPost}
        /> */}
      </div>
    </div>
  );
};