import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { 
  Menu, User, Settings, Bell, Search, 
  LogOut, X, Plus, Sun, Moon, Home, Archive 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import md5 from "md5"; // You'll need to install this package: npm install md5

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DEFAULT_AVATAR = "https://via.placeholder.com/150?text=User";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdaptiveSidebarNavbar = () => {
  const navigate = useNavigate();
  
  const [darkTheme, setDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || 
           (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking');
  const [resolvedImageUrl, setResolvedImageUrl] = useState(DEFAULT_AVATAR);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Add Classroom Modal State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const profileMenuRef = useRef(null);
  const modalRef = useRef(null);

  // Updated navigation items based on user role
  const getNavItems = useCallback(() => {
    const items = [
      { key: 'home', label: 'Home', icon: Home }
    ];
    
    if (isAdmin) {
      items.push({ key: 'archive', label: 'Archive', icon: Archive });
    }
    
    return items;
  }, [isAdmin]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddClassModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Fix for light theme - ensure proper class application
    if (darkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Explicitly update body classes as well for better theme coverage
    if (darkTheme) {
      document.body.classList.add('dark');
      document.body.classList.add('bg-gray-900');
      document.body.classList.add('text-white');
      document.body.classList.remove('bg-gray-100');
      document.body.classList.remove('text-gray-900');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.remove('text-white');
      document.body.classList.add('bg-gray-100');
      document.body.classList.add('text-gray-900');
    }
    
    // Save theme preference
    localStorage.setItem("theme", darkTheme ? "dark" : "light");
  }, [darkTheme]);

  // Improved image validation
  const isValidImageUrl = useCallback((url) => {
    return url && 
           typeof url === 'string' && 
           url.match(/^https?:\/\/.+/) && 
           !url.includes('undefined') && 
           !url.includes('null');
  }, []);

  // Get Google profile picture or Gravatar as fallback
  const getProfilePicture = useCallback((email) => {
    if (!email) return DEFAULT_AVATAR;
    
    // Try to get Google profile picture for Gmail users
    if (email.toLowerCase().endsWith('@gmail.com')) {
      // Get Google profile picture using email hash
      const hash = md5(email.toLowerCase().trim());
      return `https://www.googleapis.com/drive/v3/files/${hash}?alt=media`;
    }
    
    // Fallback to Gravatar
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  }, []);
  
  // Test multiple image sources
  const tryMultipleImageSources = useCallback((email, onSuccess, onFailure) => {
    // Array of possible image sources to try
    const sources = [
      // Google profile picture (if available)
      `https://lh3.googleusercontent.com/a/${md5(email)}=s96-c`,
      // Gravatar
      `https://www.gravatar.com/avatar/${md5(email.toLowerCase().trim())}?d=identicon&s=200`,
      // Default avatar (always works)
      DEFAULT_AVATAR
    ];
    
    let currentIndex = 0;
    
    const tryNextSource = () => {
      if (currentIndex >= sources.length) {
        // We've tried all sources, use the default
        onFailure(DEFAULT_AVATAR);
        return;
      }
      
      const img = new Image();
      img.onload = () => onSuccess(sources[currentIndex]);
      img.onerror = () => {
        currentIndex++;
        tryNextSource();
      };
      img.src = sources[currentIndex];
    };
    
    tryNextSource();
  }, []);

  useEffect(() => {
    const validateAuthentication = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      try {
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          const isValidUser = parsedUser && 
            typeof parsedUser === 'object' && 
            parsedUser.name && 
            parsedUser.email;
          
          if (isValidUser) {
            setUser(parsedUser);
            
            // Check if the character before @ in email is a letter (admin) or number (user)
            const email = parsedUser.email;
            const charBeforeAt = email.charAt(email.indexOf('@') - 1);
            const isUserAdmin = /[a-zA-Z]/.test(charBeforeAt);
            
            setIsAdmin(isUserAdmin);
            
            // Try to use the provided image URL first
            if (isValidImageUrl(parsedUser.imageUrl)) {
              // Test if the image URL works
              const img = new Image();
              img.onload = () => setResolvedImageUrl(parsedUser.imageUrl);
              img.onerror = () => {
                console.log("Provided image URL failed, trying alternative sources");
                // If the provided URL doesn't work, try alternative sources
                tryMultipleImageSources(
                  parsedUser.email,
                  (url) => setResolvedImageUrl(url),
                  () => setResolvedImageUrl(DEFAULT_AVATAR)
                );
              };
              img.src = parsedUser.imageUrl;
            } else {
              // No valid image URL provided, try to get one based on email
              tryMultipleImageSources(
                parsedUser.email,
                (url) => setResolvedImageUrl(url),
                () => setResolvedImageUrl(DEFAULT_AVATAR)
              );
            }
            
            setAuthStatus('authenticated');
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Authentication validation error:", error);
        handleLogout();
      }
    };

    validateAuthentication();
  }, [isValidImageUrl, tryMultipleImageSources]);

  const handleNavItemClick = useCallback((key) => {
    setActiveItem(key);
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isOpen) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 200);
    }
  }, [isMobile, isOpen]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (!isMobile && isOpen && window.innerWidth >= 768) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const handleLogout = useCallback(() => {
    googleLogout();
    setUser(null);
    setShowProfileMenu(false);
    setAuthStatus('unauthenticated');
    setResolvedImageUrl(DEFAULT_AVATAR);
    setIsAdmin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  // Improved image error handling
  const handleImageError = useCallback((e) => {
    console.log("Image failed to load:", e.target.src);
    if (e.target.src !== DEFAULT_AVATAR) {
      e.target.src = DEFAULT_AVATAR;
      setResolvedImageUrl(DEFAULT_AVATAR);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkTheme(prev => !prev);
  }, []);
  
  const handleCreateClass = async () => {
    if (!className.trim()) {
      setErrorMessage("Please enter a class name");
      return;
    }
    
    if (className.trim().length < 3) {
      setErrorMessage("Class name must be at least 3 characters long");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        setErrorMessage("Authentication token is missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      
      // Log request details for debugging
      console.log("Creating classroom with name:", className.trim());
      console.log("API URL:", `${API_URL}/classroom`);
      
      const response = await axios.post(
        `${API_URL}/classroom`,
        { name: className.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Log response
      console.log("Classroom creation response:", response.data);
      
      // Success
      setShowAddClassModal(false);
      setClassName("");
      
      // Show success notification
      alert("Classroom created successfully!");
      
    } catch (error) {
      console.error("Error creating classroom:", error);
      
      // Detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        setErrorMessage(error.response.data?.message || 
                       `Server error: ${error.response.status}` || 
                       "Failed to create classroom");
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setErrorMessage("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setErrorMessage(error.message || "Failed to create classroom");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Authenticating... Please wait
          </p>
        </div>
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            Authentication Failed
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const navItems = getNavItems();

  const renderProfileMenu = () => (
    <div 
      ref={profileMenuRef}
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
    >
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-12 w-12 rounded-full mr-4 overflow-hidden border-2 border-blue-300/30 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
          <img 
            src={resolvedImageUrl} 
            alt="Profile" 
            className="h-full w-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
          {isAdmin && (
            <p className="text-xs text-blue-500 font-medium mt-1">
              Admin
            </p>
          )}
        </div>
      </div>
      <div className="py-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" />
          Log Out
        </button>
      </div>
    </div>
  );
  
  const renderAddClassModal = () => (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
        {/* Modal */}
        <div 
          ref={modalRef}
          className={`w-full max-w-md p-6 rounded-xl shadow-xl ${darkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} z-50 transform transition-all`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Classroom</h2>
            <button 
              onClick={() => setShowAddClassModal(false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="className" 
              className="block text-sm font-medium mb-2"
            >
              Enter a class name
            </label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., Computer Science 101"
              className={`w-full px-4 py-2 rounded-lg border ${darkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddClassModal(false)}
              className={`mr-3 px-4 py-2 rounded-lg border ${darkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} transition-colors`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateClass}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : "Create Class"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className={`flex w-full h-screen ${darkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={`fixed md:relative h-screen ${darkTheme ? 'bg-gray-800' : 'bg-white'} backdrop-blur-lg transition-all duration-300 ease-out z-30 flex flex-col shadow-md
            ${isMobile 
              ? (isOpen 
                ? 'w-64 translate-x-0' 
                : 'w-0 -translate-x-full opacity-0') 
              : (isOpen 
                ? 'w-64' 
                : 'w-20')
            }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5">
            {isOpen && (
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo2.png" 
                  alt="Logo" 
                  className="h-8 w-auto filter brightness-125" 
                />
              </div>
            )}
            {!isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 ${darkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200 rounded-full group`}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute transition-all ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'} group-hover:scale-110 text-gray-700 dark:text-gray-300`} />
                  <X className={`absolute transition-all ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'} group-hover:scale-110 text-gray-700 dark:text-gray-300`} />
                </div>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavItemClick(item.key)}
                className={`w-full flex items-center h-12 rounded-lg
                  ${isOpen ? 'px-4' : 'px-2 justify-center'} 
                  ${activeItem === item.key 
                    ? `border-l-4 border-blue-500 ${darkTheme ? 'text-gray-100 bg-gray-700' : 'text-gray-900 bg-gray-200'}`
                    : `text-gray-600 dark:text-gray-400 ${darkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  transition-all duration-300 group`}
              >
                <item.icon className={`h-5 w-5 ${activeItem === item.key ? 'text-blue-500' : ''}`} />
                {isOpen && (
                  <span className="ml-4 font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
                {!isOpen && (
                  <div className={`absolute left-full ml-4 px-2 py-1 ${darkTheme ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span className="text-sm whitespace-nowrap dark:text-gray-200">{item.label}</span>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User Profile Section */}
          {user && (
            <div className={`p-4 border-t ${darkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3 group cursor-pointer">
                {/* Fixed profile image container with proper sizing */}
                <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-blue-300/30 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                  <img 
                    src={resolvedImageUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkTheme ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs text-blue-500 font-medium">
                        Admin
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Backdrop */}
        {isMobile && isOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <nav className={`${darkTheme ? 'bg-gray-800' : 'bg-white'} backdrop-blur-lg px-4 md:px-8 py-4 flex items-center shadow-sm relative`}>
            {isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`mr-2 p-2 ${darkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-full`}
              >
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            <div className="flex items-center space-x-3">
              <img 
                src="/logo2.png" 
                alt="Logo" 
                className="h-10 w-auto filter brightness-125 contrast-100"
              />
              <span className="hidden md:inline text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                BIT Classroom
              </span>
            </div>

            {/* Right-side Controls */}
            <div className="flex-1 flex justify-end items-center space-x-4 relative">
              {/* Search Bar */}
              <div className="hidden md:block flex-1 max-w-xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search courses, documents, alerts..."
                    className={`w-full px-4 py-2.5 pl-12 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all ${darkTheme ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-200 border-gray-300 text-gray-900 placeholder-gray-600'} border`}
                  />
                </div>
              </div>

              {/* Add Button - Only visible for admin */}
              {isAdmin && (
  <button 
    onClick={() => setShowAddClassModal(true)}
    className="p-2.5 rounded-full transition-colors text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
  >
    <Plus className="h-5 w-5" />
  </button>
)}

              {/* Profile */}
              <div className="relative">
                {/* Fixed profile image container with proper sizing */}
                <div 
                  className="h-10 w-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-300/30 hover:border-blue-500/60 transition-all bg-gray-200 dark:bg-gray-700"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img 
                    src={resolvedImageUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                {showProfileMenu && renderProfileMenu()}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`p-2.5 rounded-full ${darkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {darkTheme ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-500" />
                )}
              </button>
            </div>
          </nav>

          {/* Page Content */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${darkTheme ? 'bg-gray-900' : 'bg-gray-100'}`}>
                      <div className="max-w-7xl mx-auto">
                        <h1 className={`text-2xl font-bold ${darkTheme ? 'text-gray-200' : 'text-gray-900'} mb-4`}>
                          {navItems.find(item => item.key === activeItem)?.label}
                        </h1>
                        <div className={`${darkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                          {activeItem === 'home' && user && (
                            <div>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Name: {user.name}</p>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Email: {user.email}</p>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Role: {isAdmin ? 'Admin' : 'User'}</p>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'} mt-4`}>
                                Character before @ in email: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{user.email.charAt(user.email.indexOf('@') - 1)}</span>
                              </p>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                                This determines your role. Letters = Admin, Numbers = User
                              </p>
                            </div>
                          )}
                          {activeItem === 'archive' && (
                            <div>
                              <p className={`${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                                Archive section - Only visible to admin users
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Add Classroom Modal */}
                {showAddClassModal && renderAddClassModal()}
              </GoogleOAuthProvider>
            );
          };
          
          export default AdaptiveSidebarNavbar;