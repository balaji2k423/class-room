import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const UserPage = () => {
  useEffect(() => {
    // Disable zoom using Ctrl + Scroll and Cmd + Scroll
    const disableZoom = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };

    // Prevent double-tap zoom on touch devices
    const preventDoubleTapZoom = (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // Prevent double-click zoom
    const preventDoubleClick = (event) => {
      event.preventDefault();
    };

    // Add event listeners
    document.addEventListener("wheel", disableZoom, { passive: false });
    document.addEventListener("keydown", disableZoom, { passive: false });
    document.addEventListener("touchstart", preventDoubleTapZoom, { passive: false });
    document.addEventListener("dblclick", preventDoubleClick);

    // Disable pinch zoom
    document.documentElement.style.touchAction = 'none';

    // Cleanup function
    return () => {
      document.removeEventListener("wheel", disableZoom);
      document.removeEventListener("keydown", disableZoom);
      document.removeEventListener("touchstart", preventDoubleTapZoom);
      document.removeEventListener("dblclick", preventDoubleClick);
      document.documentElement.style.touchAction = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Sidebar />
    </div>
  );
};

export default UserPage;
