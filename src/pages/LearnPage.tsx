import React, { useState, useEffect } from 'react';
import { downloadBlogPost } from '../components/layout/dataDownload';

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

interface LearnPageProps {
  isDark: boolean;
  storedBlogIds?: string[]; // Array of blob IDs to fetch
  onCreateNew?: () => void; // Login/Admin access callback
  onViewPost?: (post: BlogPost) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ 
  isDark, 
  storedBlogIds = [], 
  onCreateNew,
  onViewPost 
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Security', 'Infrastructure', 'Analytics', 'Risk Management', 'Research'];

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

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedPosts: BlogPost[] = [];
      
      for (const blobId of storedBlogIds) {
        try {
          const post = await downloadBlogPost(blobId);
          if (post) {
            fetchedPosts.push({ ...post, blobId });
          }
        } catch (err) {
          console.error(`Failed to fetch post ${blobId}:`, err);
        }
      }
      
      // Sort by publish date (newest first)
      fetchedPosts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [storedBlogIds]);

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDark ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={`mt-4 ${isDark ? 'text-white' : 'text-gray-600'}`}>
              Loading blog posts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120]' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Research & Intelligence Hub
          </h1>
          
          <p className={`text-lg md:text-xl leading-relaxed max-w-3xl mx-auto ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Professional insights, research papers, and analysis from leading blockchain experts and institutional researchers
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
            <button 
              onClick={fetchPosts}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Categories filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
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

        {/* Posts grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className={`text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
              📝
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No posts found
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedCategory === 'All' 
                ? 'No blog posts have been published yet. Check back soon for new content!'
                : `No posts found in the ${selectedCategory} category. Try browsing other categories.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.blobId || index}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20' 
                    : 'bg-white border border-slate-200 hover:shadow-slate-200/50 hover:border-slate-300'
                }`}
                onClick={() => onViewPost?.(post)}
              >
                {/* Featured Image */}
                {post.image && (
                  <div className="mb-4 -mx-6 -mt-6">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                  </div>
                )}

                {/* Category badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isDark ? getDarkCategoryStyle(post.category) : getCategoryStyle(post.category)
                  }`}>
                    {post.category}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {post.title}
                </h2>
                
                {/* Excerpt */}
                <p className={`text-base leading-relaxed mb-4 line-clamp-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {post.excerpt}
                </p>
                
                {/* Meta info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {post.author?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <span className={`font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {post.author}
                    </span>
                  </div>
                  
                  <div className={`text-right ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <div>{post.readTime}</div>
                    <div>{formatDate(post.publishedAt)}</div>
                  </div>
                </div>

                {/* Donation indicator */}
                {post.acceptDonation && (
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <div className={`flex items-center gap-2 text-sm ${
                      isDark ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      <span>💝</span>
                      <span>Accepts donations</span>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Newsletter signup */}
        <div className={`mt-20 text-center p-12 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
        }`}>
          <h3 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Professional Research Updates
          </h3>
          
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Get exclusive access to institutional-grade research, market intelligence, and technical analysis from our team of experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-6 py-3 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-blue-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            <button className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};