import React, { useState, useEffect } from 'react';
import { LearnPage } from '../../pages/LearnPage';
import { EnhancedAdmin } from './Admin';
import { BlogPostViewer } from '../layout/blogViewer';
import { BlogPost } from '../../types/index';

interface BlogAppProps {
  isDark?: boolean;
}

export const BlogApp: React.FC<BlogAppProps> = ({ isDark = false }) => {
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'view-post'>('public');
  const [blogIds, setBlogIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const savedIds = localStorage.getItem('walrus-blog-ids');
    if (savedIds) {
      try {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          setBlogIds(parsedIds);
        }
      } catch (error) {
        console.error('Error loading blog IDs:', error);
      }
    }
  }, []);

  const handleLogin = () => {
    console.log('BlogApp: Switching to admin'); // Debug log
    setCurrentView('admin');
  };

  const handleLogout = () => {
    console.log('BlogApp: Switching to public'); // Debug log
    setCurrentView('public');
    setSelectedPost(null);
  };

  const handleBlogCreated = (blobId: string) => {
    if (!blogIds.includes(blobId)) {
      const newIds = [...blogIds, blobId];
      setBlogIds(newIds);
      localStorage.setItem('walrus-blog-ids', JSON.stringify(newIds));
    }
  };

  const handleViewPost = (post: BlogPost) => {
    console.log('BlogApp handleViewPost called with:', post.title); // Debug log
    console.log('BlogApp current view before:', currentView); // Debug log
    setSelectedPost(post);
    setCurrentView('view-post');
    console.log('BlogApp should now switch to view-post mode'); // Debug log
  };

  const handleBackToLearn = () => {
    console.log('BlogApp: Going back to learn'); // Debug log
    setSelectedPost(null);
    setCurrentView('public');
  };

  const handleDonate = (blobId: string) => {
    alert(`Donation functionality for blob ${blobId} would be implemented here`);
  };

  // Add debug logs for current state
  console.log('BlogApp render - currentView:', currentView);
  console.log('BlogApp render - selectedPost:', selectedPost?.title || 'none');

  // Admin view
  if (currentView === 'admin') {
    console.log('BlogApp: Rendering admin view'); // Debug log
    return (
      <EnhancedAdmin
        isDark={isDark}
        onNavigateToDashboard={handleLogout}
      />
    );
  }

  // Post viewing (using the same BlogPostViewer as admin)
  if (currentView === 'view-post' && selectedPost) {
    console.log('BlogApp: Rendering post view for:', selectedPost.title); // Debug log
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
  console.log('BlogApp: Rendering LearnPage'); // Debug log
  return (
    <LearnPage
      isDark={isDark}
      storedBlogIds={blogIds}
      onCreateNew={handleLogin}
      onViewPost={handleViewPost}
    />
  );
};

export default BlogApp;