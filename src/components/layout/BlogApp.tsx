import React, { useState, useEffect } from 'react';
import { LearnPage } from '../../pages/LearnPage';
import { EnhancedAdmin } from './Admin';
import { BlogPostViewer } from '../layout/blogViewer';
import { BlogPost } from '../../types/index';
import { fetchBlogIds, fetchAllBlogs, saveBlogMetadata, BlogMetadata } from '../../services/blogsIdAPI';

interface BlogAppProps {
  isDark?: boolean;
}

export const BlogApp: React.FC<BlogAppProps> = ({ isDark = false }) => {
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'view-post'>('public');
  const [blogIds, setBlogIds] = useState<string[]>([]);
  const [blogMetadata, setBlogMetadata] = useState<BlogMetadata[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog metadata from MongoDB backend on mount
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 BlogApp: Loading blogs from backend...');
        
        // Fetch all blog metadata
        const metadata = await fetchAllBlogs();
        setBlogMetadata(metadata);
        
        // Extract just the IDs for backward compatibility
        const ids = metadata.map(blog => blog.id);
        setBlogIds(ids);
        
        console.log(`✅ BlogApp: Loaded ${metadata.length} blogs from backend`);
      } catch (error) {
        console.error('❌ BlogApp: Error loading blogs:', error);
        setError('Failed to load blogs from server');
        // Fall back to empty arrays
        setBlogMetadata([]);
        setBlogIds([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const handleLogin = () => {
    console.log('BlogApp: Switching to admin');
    setCurrentView('admin');
  };

  const handleLogout = () => {
    console.log('BlogApp: Switching to public');
    setCurrentView('public');
    setSelectedPost(null);
  };

  // Save new blog metadata to MongoDB
  const handleBlogCreated = async (blobId: string, blogData?: {
    title: string;
    creator: string;
  }) => {
    try {
      console.log('📝 BlogApp: Handling blog creation:', { blobId, blogData });
      
      if (!blogData) {
        console.error('❌ BlogApp: Blog data is required');
        throw new Error('Blog title and creator are required');
      }

      // Check if blog ID already exists
      if (blogIds.includes(blobId)) {
        console.log('ℹ️ BlogApp: Blog ID already exists, skipping save');
        return;
      }

      // Save to MongoDB
      const savedBlog = await saveBlogMetadata({
        id: blobId,
        title: blogData.title,
        creator: blogData.creator
      });

      // Update local state
      const newMetadata = [...blogMetadata, savedBlog];
      const newIds = [...blogIds, blobId];
      
      setBlogMetadata(newMetadata);
      setBlogIds(newIds);

      console.log('✅ BlogApp: Blog created and saved successfully');
    } catch (error) {
      console.error('❌ BlogApp: Failed to save blog metadata:', error);
      setError('Failed to save blog to database');
      throw error; // Re-throw so the Admin component can handle it
    }
  };

  const handleViewPost = (post: BlogPost) => {
    console.log('BlogApp handleViewPost called with:', post.title);
    setSelectedPost(post);
    setCurrentView('view-post');
  };

  const handleBackToLearn = () => {
    console.log('BlogApp: Going back to learn');
    setSelectedPost(null);
    setCurrentView('public');
  };

  const handleDonate = (blobId: string) => {
    alert(`Donation functionality for blob ${blobId} would be implemented here`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDark ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={`mt-4 text-base ${isDark ? 'text-white' : 'text-gray-600'}`}>
              Loading blogs from database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠️</div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Connection Error
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  if (currentView === 'admin') {
    return (
      <EnhancedAdmin
        isDark={isDark}
        onNavigateToDashboard={handleLogout}
        onBlogCreated={handleBlogCreated} // Pass the new function
      />
    );
  }

  // Post viewing
  if (currentView === 'view-post' && selectedPost) {
    return (
      <BlogPostViewer
        post={{
          ...selectedPost,
          excerpt: selectedPost.excerpt ?? ""
        }}
        isDark={isDark}
        onBack={handleBackToLearn}
        onDonate={handleDonate}
      />
    );
  }

  // Public view (LearnPage)
  return (
    <LearnPage
      isDark={isDark}
      storedBlogIds={blogIds}
      blogMetadata={blogMetadata} // Pass metadata for better performance
      onCreateNew={handleLogin}
      onViewPost={handleViewPost}
    />
  );
};

export default BlogApp;