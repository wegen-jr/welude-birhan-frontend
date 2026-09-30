import React, { createContext, useContext, useState, useEffect } from 'react';

/* =========================================================================
   1. CMS CONSTANTS & ENUM OBJECTS
   ========================================================================= */
export const CMS_STORAGE_KEYS = {
  POSTS: 'welude_birhan_cms_posts',
  AUTH: 'welude_birhan_coordinator_auth',
};

export const CMS_VIEWS = {
  PUBLIC: 'public',
  LOGIN: 'login',
  PORTAL: 'portal',
};

export const POST_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
};

export const POST_PLACEMENT = {
  UPCOMING_GRID: 'Upcoming Events Grid',
  URGENT_BANNER: 'Urgent Notice Banner',
};

export const POST_CATEGORY = {
  SPIRITUAL_FEAST: 'Spiritual Feast',
  MEZMUR: 'Mezmur',
  ACADEMIC: 'Academic',
  GENERAL: 'General',
};

export const DEFAULT_COORDINATOR_PROFILE = {
  name: 'Deacon Kidanewold',
  email: 'coordinator@weludebirhan.org',
  role: 'Sunday School Coordinator',
  division: 'Senior Youth & Liturgical Affairs',
  avatar: '✝',
};

export const POST_DEFAULTS = {
  title: 'Untitled Announcement',
  category: POST_CATEGORY.GENERAL,
  time: 'TBD',
  location: 'Holy Trinity Sunday School',
  placement: POST_PLACEMENT.UPCOMING_GRID,
  description: '',
  status: POST_STATUS.PUBLISHED,
  authorFallback: 'Sunday School Coordinator',
};

/* =========================================================================
   2. INITIAL SEED DATA (MOCK POSTS)
   ========================================================================= */
export const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Annual Feast of the Holy Trinity (በዓለ ሥላሴ)',
    category: POST_CATEGORY.SPIRITUAL_FEAST,
    date: '2026-10-07',
    time: '6:00 AM - 1:00 PM',
    location: 'Holy Trinity Cathedral Sanctuary',
    placement: POST_PLACEMENT.UPCOMING_GRID,
    description:
      'Join our annual liturgical celebration with Holy Mass, blessing of Sunday school children, and special spiritual hymns sung by our youth choir.',
    status: POST_STATUS.PUBLISHED,
    author: DEFAULT_COORDINATOR_PROFILE.name,
    createdAt: '2026-09-20T08:30:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Spiritual Mezmur & Hymn Workshop (የዝማሬ አውደ ጥናት)',
    category: POST_CATEGORY.MEZMUR,
    date: '2026-10-15',
    time: '3:00 PM - 6:00 PM',
    location: 'Sunday School Auditorium',
    placement: POST_PLACEMENT.UPCOMING_GRID,
    description:
      'An intensive vocal training and Saint Yared musical notation practice for all Sunday school youth and senior vocalists.',
    status: POST_STATUS.PUBLISHED,
    author: DEFAULT_COORDINATOR_PROFILE.name,
    createdAt: '2026-09-22T10:15:00.000Z',
  },
  {
    id: 'post-3',
    title: "Autumn Orthodox Faith & Ge'ez Literacy Registration",
    category: POST_CATEGORY.ACADEMIC,
    date: '2026-10-24',
    time: '9:00 AM - 1:00 PM',
    location: 'Educational Wing - Hall 4',
    placement: POST_PLACEMENT.UPCOMING_GRID,
    description:
      "Enrollment for new students in foundational Ge'ez language, church history, dogma, and Holy Scriptures study.",
    status: POST_STATUS.DRAFT,
    author: DEFAULT_COORDINATOR_PROFILE.name,
    createdAt: '2026-09-25T14:00:00.000Z',
  },
];

/* =========================================================================
   3. STORAGE UTILITY WRAPPERS
   ========================================================================= */
const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key}:`, e);
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key}:`, e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove ${key}:`, e);
    }
  },
};

/* =========================================================================
   4. CONTEXT & PROVIDER IMPLEMENTATION
   ========================================================================= */
export const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  // Post state loaded from storage or seed configuration
  const [posts, setPosts] = useState(() => {
    const saved = storage.get(CMS_STORAGE_KEYS.POSTS);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_POSTS;
  });

  // UI Navigation / View state
  const [activeView, setActiveView] = useState(CMS_VIEWS.PUBLIC);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Authenticated Coordinator profile state
  const [user, setUser] = useState(() => storage.get(CMS_STORAGE_KEYS.AUTH, null));

  // Sync posts on changes
  useEffect(() => {
    storage.set(CMS_STORAGE_KEYS.POSTS, posts);
  }, [posts]);

  // Sync auth state on changes
  useEffect(() => {
    if (user) {
      storage.set(CMS_STORAGE_KEYS.AUTH, user);
    } else {
      storage.remove(CMS_STORAGE_KEYS.AUTH);
    }
  }, [user]);

  /* ---------------- CRUD Actions ---------------- */

  const addPost = (postData = {}) => {
    const nowIso = new Date().toISOString();
    const newPost = {
      id: `post-${Date.now()}`,
      title: postData.title?.trim() || POST_DEFAULTS.title,
      category: postData.category || POST_DEFAULTS.category,
      date: postData.date || nowIso.split('T')[0],
      time: postData.time || POST_DEFAULTS.time,
      location: postData.location || POST_DEFAULTS.location,
      placement: postData.placement || POST_DEFAULTS.placement,
      description: postData.description?.trim() || POST_DEFAULTS.description,
      status: postData.status || POST_DEFAULTS.status,
      author: user?.name || POST_DEFAULTS.authorFallback,
      createdAt: nowIso,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
    return newPost;
  };

  const deletePost = (id) => {
    setPosts((prevPosts) => prevPosts.filter((item) => item.id !== id));
  };

  const toggleStatus = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === POST_STATUS.PUBLISHED
              ? POST_STATUS.DRAFT
              : POST_STATUS.PUBLISHED;
          return { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return item;
      })
    );
  };

  const updatePost = (id, updatedFields) => {
    setPosts((prevPosts) =>
      prevPosts.map((item) =>
        item.id === id
          ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const resetToDefault = () => {
    setPosts(INITIAL_POSTS);
    storage.remove(CMS_STORAGE_KEYS.POSTS);
  };

  /* ---------------- Auth Helpers ---------------- */

  const login = (credentials = {}) => {
    const coordinatorUser = {
      name: credentials.name || DEFAULT_COORDINATOR_PROFILE.name,
      email: credentials.email || DEFAULT_COORDINATOR_PROFILE.email,
      role: DEFAULT_COORDINATOR_PROFILE.role,
      division: DEFAULT_COORDINATOR_PROFILE.division,
      avatar: DEFAULT_COORDINATOR_PROFILE.avatar,
    };
    setUser(coordinatorUser);
    setIsLoginModalOpen(false);
    setActiveView(CMS_VIEWS.PORTAL);
    return true;
  };

  const logout = () => {
    setUser(null);
    setActiveView(CMS_VIEWS.PUBLIC);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  /* ---------------- Derived Collections & Analytics ---------------- */

  const publishedPosts = posts.filter((p) => p.status === POST_STATUS.PUBLISHED);
  const draftPosts = posts.filter((p) => p.status === POST_STATUS.DRAFT);
  const publishedGridEvents = publishedPosts.filter(
    (p) => p.placement === POST_PLACEMENT.UPCOMING_GRID
  );
  const urgentNotices = publishedPosts.filter(
    (p) => p.placement === POST_PLACEMENT.URGENT_BANNER
  );

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

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

export default ContentContext;