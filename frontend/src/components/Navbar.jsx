import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isMobile, 
  sidebarWidth 
}) => {
  const topNavItems = [
    { label: "Home", link: "#" },
    { label: "About", link: "#" },
    { label: "Services", link: "#" },
    { label: "Contact", link: "#" },
  ];

  return (
    <div
      className="transition-all duration-300 flex-1"
      style={{
        marginLeft: `${sidebarWidth}px`,
      }}
    >
      <nav className="bg-gray-900 text-white w-full z-40 shadow-md px-6 py-4 flex justify-between items-center fixed">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 text-white"
              aria-label="Toggle Sidebar"
            >
              <FontAwesomeIcon
                icon={isSidebarOpen ? faTimes : faBars}
                className="text-xl"
              />
            </button>
          )}
          <div className="text-2xl font-bold">MyApp</div>
        </div>
        
        {!isMobile && (
          <div className="hidden md:flex space-x-6">
            {topNavItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="hover:text-blue-400 transition duration-300 no-underline text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Page Content */}
      <div className="pt-16 p-6 flex-1 bg-gray-100">
        {/* Your page content goes here */}
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p>This is your content area. The navigation is now fully responsive and adaptive.</p>
      </div>
    </div>
  );
};

export default Navbar;