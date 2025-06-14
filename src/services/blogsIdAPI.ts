// Updated blogsIdApi.ts - Now works with full blog objects
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`;

export interface BlogMetadata {
  id: string;          // Walrus blob ID
  title: string;       // Blog title
  creator: string;     // Author name
  createdAt?: Date; 
}

export interface BlogResponse {
  success: boolean;
  data?: BlogMetadata | BlogMetadata[];
  count?: number;
  message?: string;
  error?: string;
}

// Fetch all blog metadata from MongoDB
export async function fetchBlogIds(): Promise<string[]> {
  try {
    console.log('🔍 Fetching blog IDs from backend...');
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: BlogResponse = await response.json();
    
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Invalid response format');
    }
    
    const blogIds = result.data.map(blog => blog.id);
    console.log(`Fetched ${blogIds.length} blog IDs:`, blogIds);
    
    return blogIds;
  } catch (error) {
    console.error('Error fetching blog IDs:', error);
    throw new Error('Failed to fetch blog IDs from server');
  }
}

// Fetch all blog metadata (not just IDs)
export async function fetchAllBlogs(): Promise<BlogMetadata[]> {
  try {
    console.log('Fetching all blog metadata from backend...');
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: BlogResponse = await response.json();
    
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Invalid response format');
    }
    
    console.log(`Fetched ${result.data.length} blogs from backend`);
    return result.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs from server');
  }
}

// Save new blog metadata to MongoDB
export async function saveBlogMetadata(blogData: {
  id: string;
  title: string;
  creator: string;
}): Promise<BlogMetadata> {
  try {
    console.log('Saving blog metadata to backend:', blogData);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result: BlogResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to save blog metadata');
    }
    
    console.log('Blog metadata saved successfully:', result.data);
    return result.data as BlogMetadata;
  } catch (error) {
    console.error('Error saving blog metadata:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function saveBlogId(id: string): Promise<void> {
  console.warn('saveBlogId is deprecated. Use saveBlogMetadata instead.');
  throw new Error('This function requires title and creator. Use saveBlogMetadata instead.');
}

// Get specific blog metadata by ID
export async function getBlogMetadata(id: string): Promise<BlogMetadata | null> {
  try {
    console.log(`Fetching blog metadata for ID: ${id}`);
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 404) {
      console.log(`iBlog with ID ${id} not found`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: BlogResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Blog not found');
    }
    
    console.log('Blog metadata fetched:', result.data);
    return result.data as BlogMetadata;
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
    throw error;
  }
}

// Delete blog from MongoDB
export async function deleteBlogMetadata(id: string): Promise<boolean> {
  try {
    console.log(`Deleting blog metadata for ID: ${id}`);
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result: BlogResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete blog metadata');
    }
    
    console.log('Blog metadata deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting blog metadata:', error);
    return false;
  }
}