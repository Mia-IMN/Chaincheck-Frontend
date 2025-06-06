import React, { useState } from 'react';
import { LearnPage } from '../../pages/LearnPage';
import { EnhancedAdmin } from './Admin';

interface BlogAppProps {
  isDark?: boolean;
}

export const BlogApp: React.FC<BlogAppProps> = ({ isDark = false }) => {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [blogIds, setBlogIds] = useState<string[]>([]);

  // Load blog IDs from localStorage on component mount
  React.useEffect(() => {
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

  // Handle login button click
  const handleLogin = () => {
    setCurrentView('admin');
  };

  // Handle logout/back to public view
  const handleLogout = () => {
    setCurrentView('public');
  };

  // Handle new blog post creation
  const handleBlogCreated = (blobId: string) => {
    if (!blogIds.includes(blobId)) {
      const newIds = [...blogIds, blobId];
      setBlogIds(newIds);
      localStorage.setItem('walrus-blog-ids', JSON.stringify(newIds));
    }
  };

  // Render appropriate view
  if (currentView === 'admin') {
    return (
      <EnhancedAdmin
        isDark={isDark}
        onNavigateToDashboard={handleLogout}
      />
    );
  }

  return (
    <LearnPage
      isDark={isDark}
      storedBlogIds={blogIds}
      onCreateNew={handleLogin}
      onViewPost={(post) => {
        console.log('View post:', post.title);
        // Handle post viewing - you can navigate to a detailed view here
      }}
    />
  );
};

export default BlogApp;