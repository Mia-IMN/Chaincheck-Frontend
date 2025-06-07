import React from 'react';

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

interface BlogPostViewerProps {
  post: BlogPost; 
  isDark: boolean;
  onBack?: () => void;
  onDonate?: (blobId: string) => void;
}

export const BlogPostViewer: React.FC<BlogPostViewerProps> = ({ 
  post, 
  isDark, 
  onBack,
  onDonate 
}) => {
  const getCategoryStyle = (category: string) => {
    const styles = {
      'Security': isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800',
      'Infrastructure': isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800',
      'Analytics': isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800',
      'Risk Management': isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-800',
      'Research': isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
    };
    return styles[category as keyof typeof styles] || (isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Convert simple formatting to HTML
    let formatted = content
      // Convert video placeholders to iframes
      .replace(/\[VIDEO: (.*?)\]/g, '<div class="video-container my-8"><iframe src="$1" frameborder="0" allowfullscreen class="w-full h-64 rounded-lg"></iframe></div>')
      // Convert line breaks to paragraphs
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p class="mb-4 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');

    return formatted;
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120]' : 'bg-white'
    }`}>
      {/* Header with back button */}
      <div className={`sticky top-0 z-10 border-b backdrop-blur-sm ${
        isDark ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(post.publishedAt)} • {post.readTime}
              </div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {post.title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <article className="max-w-4xl mx-auto px-6 py-20">
        {/* Featured image */}
        {post.image && (
          <div className="mb-8">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-80 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Category badge */}
        <div className="mb-6">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getCategoryStyle(post.category)}`}>
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {post.title}
        </h1>

        {/* Author and meta info */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-current/10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
            isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
          }`}>
            {post.author?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {post.author}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatDate(post.publishedAt)} • {post.readTime}
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className={`prose prose-lg max-w-none ${
            isDark ? 'prose-invert' : ''
          }`}
          style={{
            color: isDark ? '#e2e8f0' : '#374151',
            lineHeight: '1.8'
          }}
          dangerouslySetInnerHTML={{ 
            __html: formatContent(post.content) 
          }}
        />

        {/* Donation section */}
        {post.acceptDonation && (
          <div className={`mt-12 p-8 rounded-2xl border ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-4">💝</div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-yellow-400' : 'text-yellow-800'
              }`}>
                Support this author
              </h3>
              <p className={`mb-6 ${
                isDark ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                If you found this post valuable, consider supporting the author with a donation.
              </p>
              <button
                onClick={() => onDonate?.(post.blobId || '')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isDark 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                } hover:scale-105`}
              >
                Make a Donation
              </button>
            </div>
          </div>
        )}

        {/* Related posts prompt */}
        <div className={`mt-16 pt-8 border-t ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="text-center">
            <h3 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Explore More Content
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Discover more insights and research from our expert contributors.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
              >
                Back to Articles
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};