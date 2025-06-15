import React, { useState, useRef } from 'react';
import { uploadBlogPost } from './dataUpload';

interface BlogCreatorProps {
  isDark: boolean;
  onPublish?: (blobId: string, blogData: {
    title: string;
    author: string;
  }) => Promise<void>; // Updated to include metadata and be async
  onCancel?: () => void;
}

export const BlogCreator: React.FC<BlogCreatorProps> = ({ isDark, onPublish, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    excerpt: '',
    category: 'Research',
    image: '',
    acceptDonation: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nicheOptions = [
    'Security',
    'Infrastructure', 
    'Analytics',
    'Risk Management',
    'Research'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null); // Clear any existing errors when user types
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = () => fileInputRef.current?.click();

  const insertVideo = () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url && contentRef.current) {
      const videoEmbed = `\n\n[VIDEO: ${url}]\n\n`;
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + videoEmbed + formData.content.substring(end);
      setFormData(prev => ({ ...prev, content: newContent }));
    }
  };

  const generateExcerpt = () => {
    if (formData.content) {
      const plainText = formData.content.replace(/\[.*?\]/g, '').replace(/\n/g, ' ');
      const excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  const handlePublish = async () => {
    // Clear any existing errors
    setError(null);

    // Validate required fields
    if (!formData.title?.trim()) {
      setError('Please enter a blog title');
      return;
    }

    if (!formData.author?.trim()) {
      setError('Please enter an author name');
      return;
    }

    if (!formData.content?.trim()) {
      setError('Please enter blog content');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('🚀 BlogCreator: Starting blog publication...');
      
      // Add computed fields to the blog data
      const readTime = `${Math.ceil(formData.content.split(' ').length / 200)} min read`;
      const publishedAt = new Date().toISOString();
      
      // Auto-generate excerpt if not provided
      let excerpt = formData.excerpt;
      if (!excerpt?.trim()) {
        const plainText = formData.content.replace(/\[.*?\]/g, '').replace(/\n/g, ' ');
        excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      }

      // Prepare blog post data for Walrus
      const blogPostData = {
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        content: formData.content.trim(),
        excerpt: excerpt.trim(),
        publishedAt,
        readTime
      };

      console.log('📝 BlogCreator: Uploading to Walrus...', {
        title: blogPostData.title,
        author: blogPostData.author,
        category: blogPostData.category
      });

      // Upload to Walrus
      const blobId = await uploadBlogPost(blogPostData);
      
      if (!blobId) {
        throw new Error('Failed to upload blog post to Walrus network');
      }

      console.log('✅ BlogCreator: Uploaded to Walrus with ID:', blobId);

      // Save metadata to MongoDB via parent component
      if (onPublish) {
        console.log('💾 BlogCreator: Saving metadata to database...');
        
        await onPublish(blobId, {
          title: formData.title.trim(),
          author: formData.author.trim()
        });

        console.log('✅ BlogCreator: Blog metadata saved to database');
      }

      // Show success message
      alert('🎉 Blog post published successfully!\n\n✅ Uploaded to Walrus network\n✅ Saved to database\n\nYour post is now live!');

      // Reset form after successful publication
      setFormData({
        title: '',
        content: '',
        author: '',
        excerpt: '',
        category: 'Research',
        image: '',
        acceptDonation: false
      });

      console.log('🎯 BlogCreator: Publication completed successfully');

    } catch (error) {
      console.error('❌ BlogCreator: Error during publication:', error);
      
      // Set specific error message
      if (error instanceof Error) {
        setError(`Publication failed: ${error.message}`);
      } else {
        setError('An unexpected error occurred while publishing. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\[VIDEO: (.*?)\]/g, '<iframe src="$1" frameborder="0" allowfullscreen></iframe>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0B1120]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-24 lg:py-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create New Post
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                isDark
                  ? 'border border-white/20 text-white hover:bg-white/5'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isUploading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-3 sm:px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Publishing...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Publish to Walrus & Database</span>
                  <span className="sm:hidden">Publish</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-xs sm:text-sm underline hover:no-underline self-start sm:self-auto ml-7 sm:ml-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {showPreview ? (
          /* Preview Mode */
          <div className={`space-y-4 sm:space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formData.image && (
              <img
                src={formData.image}
                alt="Featured"
                className="w-full h-48 sm:h-64 object-cover rounded-xl"
              />
            )}
            <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
              {formData.category}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{formData.title || 'Your Title Here'}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-70">
              <span>By {formData.author || 'Author Name'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{new Date().toLocaleDateString()}</span>
              <span className="hidden sm:inline">•</span>
              <span>{Math.ceil((formData.content?.split(' ').length || 0) / 200)} min read</span>
            </div>
            {formData.excerpt && (
              <div className="text-base sm:text-lg text-gray-600 italic border-l-4 border-blue-500 pl-3 sm:pl-4">
                {formData.excerpt}
              </div>
            )}
            <div
              className="prose prose-sm sm:prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatContent(formData.content || 'Your content will appear here...')
              }}
            />
            {formData.acceptDonation && (
              <div className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl border ${
                isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">💝</div>
                  <div className={`font-semibold text-sm sm:text-base ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    This post accepts donations
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4 sm:space-y-6">
            {/* Featured Image */}
            <div className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors ${
              isDark ? 'border-white/20 hover:border-white/30' : 'border-gray-300 hover:border-gray-400'
            }`}>
              {formData.image ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image}
                    alt="Featured"
                    className="max-h-32 sm:max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <p className={`text-sm sm:text-base ${isDark ? 'text-white/70' : 'text-gray-400'}`}>
                    No featured image selected.
                  </p>
                  <button
                    onClick={insertImage}
                    className="mt-2 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base"
                  >
                    Upload Image
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter your blog post title..."
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-3 sm:p-4 rounded-lg text-lg sm:text-2xl font-semibold outline-none transition-colors border ${
                  isDark ? 'bg-[#121B30] text-white placeholder-white/60 border-white/10 focus:border-blue-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Author and Category - Side by side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Author */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  placeholder="Your name or pen name..."
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg outline-none transition-colors border text-sm sm:text-base ${
                    isDark ? 'bg-[#121B30] text-white placeholder-white/60 border-white/10 focus:border-blue-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg outline-none transition-colors border text-sm sm:text-base ${
                    isDark ? 'bg-[#121B30] text-white border-white/10 focus:border-blue-400' : 'bg-gray-100 text-gray-900 border-gray-200 focus:border-blue-500'
                  }`}
                >
                  {nicheOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <label className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  Excerpt (optional)
                </label>
                <button
                  onClick={generateExcerpt}
                  className={`text-xs sm:text-sm underline hover:no-underline transition-opacity self-start sm:self-auto ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Generate from content
                </button>
              </div>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="Brief description of your post (will be auto-generated if left empty)..."
                value={formData.excerpt}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg outline-none transition-colors resize-none border text-sm sm:text-base ${
                  isDark ? 'bg-[#121B30] text-white placeholder-white/60 border-white/10 focus:border-blue-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Content */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                Content *
              </label>
              <textarea
                name="content"
                ref={contentRef}
                rows={12}
                placeholder="Write your blog content here... Use [VIDEO: URL] to embed videos."
                value={formData.content}
                onChange={handleInputChange}
                className={`w-full p-3 sm:p-4 rounded-lg outline-none transition-colors resize-y border text-sm sm:text-base ${
                  isDark ? 'bg-[#121B30] text-white placeholder-white/60 font-mono tracking-wide border-white/10 focus:border-blue-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500 font-mono tracking-wide border-gray-200 focus:border-blue-500'
                }`}
              />
              <div className={`mt-1 text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Estimated read time: {Math.ceil((formData.content?.split(' ').length || 0) / 200)} minutes
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={insertImage}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-center"
                >
                  📷 Insert Image
                </button>
                <button
                  onClick={insertVideo}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-center"
                >
                  🎥 Insert Video
                </button>
              </div>
              
              <label className={`flex items-center gap-2 cursor-pointer select-none text-sm ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                <input
                  type="checkbox"
                  name="acceptDonation"
                  checked={formData.acceptDonation}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span>💝 Accept donations</span>
              </label>
            </div>

            {/* Publishing Info */}
            <div className={`p-3 sm:p-4 rounded-lg border ${
              isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-xs sm:text-sm">Publishing Info</span>
              </div>
              <div className="text-xs space-y-1">
                <div>✅ Content will be stored on Walrus decentralized network</div>
                <div>✅ Metadata will be saved to your secure database</div>
                <div>✅ Post will be immediately available to all users</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};