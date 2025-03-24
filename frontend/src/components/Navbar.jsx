import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="text-2xl font-bold">MyApp</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-400 transition duration-300">
              Home
            </a>
            <a href="#" className="hover:text-blue-400 transition duration-300">
              About
            </a>
            <a href="#" className="hover:text-blue-400 transition duration-300">
              Services
            </a>
            <a href="#" className="hover:text-blue-400 transition duration-300">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? (
                <span className="text-xl">&#10006;</span> // Close Icon
              ) : (
                <span className="text-xl">&#9776;</span> // Hamburger Icon
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 py-4 space-y-4 text-center transition-all duration-300 ease-in-out">
          <a href="#" className="block hover:text-blue-400 transition duration-300">
            Home
          </a>
          <a href="#" className="block hover:text-blue-400 transition duration-300">
            About
          </a>
          <a href="#" className="block hover:text-blue-400 transition duration-300">
            Services
          </a>
          <a href="#" className="block hover:text-blue-400 transition duration-300">
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
