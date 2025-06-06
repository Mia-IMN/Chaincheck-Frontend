import React, { useState } from 'react';

interface AdminProps {
  isDark: boolean;
  onNavigateToDashboard?: () => void;
}

export const Admin: React.FC<AdminProps> = ({ isDark, onNavigateToDashboard }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    title: '',
    niche: '',
    content: '',
    acceptDonation: false
  });

  const nicheOptions = [
    'Security',
    'Infrastructure', 
    'Analytics',
    'Risk Management',
    'Research'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
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

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
      isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={onNavigateToDashboard}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all duration-200 ${
            isDark 
              ? 'text-slate-300 hover:text-white hover:bg-white/5' 
              : 'text-slate-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <h1 className={`text-3xl font-bold text-center mb-12 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Admin Panel
        </h1>

        {/* Main Form Container */}
        <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          
          <div className="space-y-8">
            
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter blog post title"
                />
              </div>
            </div>

            {/* Niche Dropdown */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Niche *
              </label>
              <select
                name="niche"
                value={formData.niche}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="" disabled>Select a niche</option>
                {nicheOptions.map((option) => (
                  <option 
                    key={option} 
                    value={option}
                    className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Featured Image
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image URL Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className={`block text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-white/10 border-white/20 text-white file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4' 
                        : 'bg-white border-gray-300 text-gray-900 file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4'
                    }`}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Image Preview:
                  </p>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Blog Content */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Blog Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={8}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Write your blog content here... Use markdown for formatting."
              />
            </div>

            {/* Accept Donation Checkbox */}
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-[#2F5A8A] to-[#437AF3] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
              >
                Publish Post
              </button>
              
              <button
                type="button"
                className={`flex-1 px-8 py-4 rounded-xl font-semibold border transition-all duration-200 ${
                  isDark 
                    ? 'border-white/20 text-white hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;