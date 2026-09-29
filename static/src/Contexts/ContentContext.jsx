import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial mock data: 2 published events and 1 draft as specified
export const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Annual Feast of the Holy Trinity (በዓለ ሥላሴ)',
    category: 'Spiritual Feast',
    date: '2026-10-07',
    time: '6:00 AM - 1:00 PM',
    location: 'Holy Trinity Cathedral Sanctuary',
    placement: 'Upcoming Events Grid',
    description: 'Join our annual liturgical celebration with Holy Mass, blessing of Sunday school children, and special spiritual hymns sung by our youth choir.',
    status: 'published',
    author: 'Deacon Kidanewold',
    createdAt: '2026-09-20T08:30:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Spiritual Mezmur & Hymn Workshop (የዝማሬ አውደ ጥናት)',
    category: 'Mezmur',
    date: '2026-10-15',
    time: '3:00 PM - 6:00 PM',
    location: 'Sunday School Auditorium',
    placement: 'Upcoming Events Grid',
    description: 'An intensive vocal training and Saint Yared musical notation practice for all Sunday school youth and senior vocalists.',
    status: 'published',
    author: 'Deacon Kidanewold',
    createdAt: '2026-09-22T10:15:00.000Z',
  },
  {
    id: 'post-3',
    title: 'Autumn Orthodox Faith & Ge\'ez Literacy Registration',
    category: 'Academic',
    date: '2026-10-24',
    time: '9:00 AM - 1:00 PM',
    location: 'Educational Wing - Hall 4',
    placement: 'Upcoming Events Grid',
    description: 'Enrollment for new students in foundational Ge\'ez language, church history, dogma, and Holy Scriptures study.',
    status: 'draft',
    author: 'Deacon Kidanewold',
    createdAt: '2026-09-25T14:00:00.000Z',
  }
];

const STORAGE_KEY = 'welude_birhan_cms_posts';
const AUTH_KEY = 'welude_birhan_coordinator_auth';

export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  // Load posts from localStorage if available, or initialize with mock data
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved posts from localStorage:', e);
    }
    return INITIAL_POSTS;
  });

  // Active view management: 'public' | 'login' | 'portal'
  const [activeView, setActiveView] = useState('public');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Coordinator Authentication state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to persist posts:', e);
    }
  }, [posts]);

  // Sync user authentication to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist auth:', e);
    }
  }, [user]);

  // Method: Add a new post
  const addPost = (postData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      title: postData.title?.trim() || 'Untitled Announcement',
      category: postData.category || 'General',
      date: postData.date || new Date().toISOString().split('T')[0],
      time: postData.time || 'TBD',
      location: postData.location || 'Holy Trinity Sunday School',
      placement: postData.placement || 'Upcoming Events Grid',
      description: postData.description?.trim() || '',
      status: postData.status || 'published',
      author: user?.name || 'Sunday School Coordinator',
      createdAt: new Date().toISOString(),
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
    return newPost;
  };

  // Method: Delete a post by ID
  const deletePost = (id) => {
    setPosts((prevPosts) => prevPosts.filter((item) => item.id !== id));
  };

  // Method: Toggle publication status between 'published' and 'draft'
  const toggleStatus = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'published' ? 'draft' : 'published';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Method: Update existing post
  const updatePost = (id, updatedFields) => {
    setPosts((prevPosts) =>
      prevPosts.map((item) =>
        item.id === id ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  // Method: Reset to factory initial state
  const resetToDefault = () => {
    setPosts(INITIAL_POSTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auth helper methods
  const login = (credentials = {}) => {
    const coordinatorUser = {
      name: credentials.name || 'Deacon Kidanewold',
      email: credentials.email || 'coordinator@weludebirhan.org',
      role: 'Sunday School Coordinator',
      division: 'Senior Youth & Liturgical Affairs',
      avatar: '✝',
    };
    setUser(coordinatorUser);
    setIsLoginModalOpen(false);
    setActiveView('portal');
    return true;
  };

  const logout = () => {
    setUser(null);
    setActiveView('public');
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Derived collections
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const publishedGridEvents = publishedPosts.filter((p) => p.placement === 'Upcoming Events Grid');
  const urgentNotices = publishedPosts.filter((p) => p.placement === 'Urgent Notice Banner');

  // Stats calculation
  const stats = {
    totalPosts: posts.length,
    publishedCount: publishedPosts.length,
    draftCount: draftPosts.length,
    categoriesCount: new Set(posts.map((p) => p.category)).size,
    urgentCount: urgentNotices.length,
  };

  return (
    <ContentContext.Provider
      value={{
        posts,
        publishedPosts,
        draftPosts,
        publishedGridEvents,
        urgentNotices,
        stats,
        addPost,
        deletePost,
        toggleStatus,
        updatePost,
        resetToDefault,
        activeView,
        setActiveView,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

// Custom hook for consuming the ContentContext
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
export default ContentContext;
