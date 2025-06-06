import React, { useState, useRef } from 'react';
import { uploadBlogPost } from './dataUpload';

interface BlogCreatorProps {
  isDark: boolean;
  onPublish?: (blobId: string) => void;
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
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const insertVideo = () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url && contentRef.current) {
      const videoEmbed = `\n\n[VIDEO: ${url}]\n\n`;
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + videoEmbed + formData.content.substring(end);
      
      setFormData(prev => ({
        ...prev,
        content: newContent
      }));
    }
  };

  const generateExcerpt = () => {
    if (formData.content) {
      const plainText = formData.content.replace(/\[.*?\]/g, '').replace(/\n/g, ' ');
      const excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
      setFormData(prev => ({
        ...prev,
        excerpt
      }));
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content || !formData.author) {
      alert('Please fill in all required fields (Title, Content, Author)');
      return;
    }

    setIsUploading(true);
    try {
      const blobId = await uploadBlogPost(formData);
      if (blobId) {
        alert('Blog post published successfully!');
        onPublish?.(blobId);
        // Reset form
        setFormData({
          title: '',
          content: '',
          author: '',
          excerpt: '',
          category: 'Research',
          image: '',
          acceptDonation: false
        });
      } else {
        alert('Failed to publish blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('An error occurred while publishing. Please try again.');
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
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120]' : 'bg-white'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Create New Post
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
              className="bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
            >
              {isUploading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Featured" 
                className="w-full h-64 object-cover rounded-xl"
              />
            )}
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
            }`}>
              {formData.category}
            </div>
            <h1 className="text-4xl font-bold leading-tight">{formData.title || 'Your Title Here'}</h1>
            <div className="flex items-center gap-4 text-sm opacity-70">
              <span>By {formData.author || 'Author Name'}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(formData.content || 'Your content will appear here...') 
              }}
            />
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Featured Image */}
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDark ? 'border-white/20 hover:border-white/30' : 'border-gray-300 hover:border-gray-400'
            }`}>
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Featured" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={insertImage}
                    className={`text-4xl mb-4 ${isDark ? 'text-white/50' : 'text-gray-400'}`}
                  >
                    📸
                  </button>
                  <p className={`${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    Click to add a featured image
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Category and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-700'
                }`}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  {nicheOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-white' : 'text-gray-700'
                }`}>
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Write your story title..."
                className={`w-full text-4xl font-bold border-none outline-none bg-transparent placeholder-opacity-50 ${
                  isDark ? 'text-white placeholder-white/50' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Toolbar */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                onClick={insertImage}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="Insert Image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={insertVideo}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="Insert Video"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div className={`h-6 w-px ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
              <button
                onClick={generateExcerpt}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                Generate Excerpt
              </button>
            </div>

            {/* Content */}
            <textarea
              ref={contentRef}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Tell your story..."
              className={`w-full min-h-[400px] text-lg leading-relaxed border-none outline-none bg-transparent resize-none ${
                isDark ? 'text-white placeholder-white/50' : 'text-gray-900 placeholder-gray-400'
              }`}
            />

            {/* Excerpt */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-white' : 'text-gray-700'
              }`}>
                Excerpt (Optional)
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief summary of your post..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Accept Donation */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptDonation"
                  checked={formData.acceptDonation}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Accept Donations
                  </span>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Allow readers to support your work through donations
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};