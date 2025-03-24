import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faPalette, faImages, faThumbtack, 
  faHeart, faChartLine, faFire, faMagic, faGem, faCaretUp 
} from '@fortawesome/free-solid-svg-icons';
import { faCodepen } from '@fortawesome/free-brands-svg-icons';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="absolute left-[1vw] top-[1vw] h-[calc(100%-2vw)] bg-[#18283b] rounded-2xl flex flex-col text-[#f5f6fa] font-sans overflow-hidden select-none"
      style={{
        width: isExpanded || isMobile ? '256px' : '80px',
        transition: 'width 0.3s ease-in-out'
      }}
    >
      {/* Menu Icon */}
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <FontAwesomeIcon icon={faBars} className="text-white text-xl" />
      </div>
      
      {/* Nav Header */}
      <div className="relative min-h-20 z-10 flex items-center px-4">
        <a 
          href="https://codepen.io" target="_blank" rel="noreferrer"
          className={`text-2xl transition-opacity duration-300 ${!isExpanded && !isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          C<FontAwesomeIcon icon={faCodepen} />DEPEN
        </a>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4">
        {[
          { icon: faPalette, label: "Your Work" },
          { icon: faImages, label: "Assets" },
          { icon: faThumbtack, label: "Pinned Items" },
          { icon: faHeart, label: "Following" },
          { icon: faChartLine, label: "Trending" },
          { icon: faFire, label: "Challenges" },
          { icon: faMagic, label: "Spark" },
          { icon: faGem, label: "Codepen Pro" }
        ].map((item, index) => (
          <div 
            key={index}
            className="relative flex items-center ml-4 h-[54px] text-[#8392a5] cursor-pointer transition-all duration-200
                       hover:bg-white hover:bg-opacity-10 rounded-lg hover:text-black" 
          >
            <FontAwesomeIcon 
              icon={item.icon} 
              className="min-w-12 text-center text-lg" 
            />
            <span className={`transition-opacity duration-300 ${!isExpanded && !isMobile ? 'opacity-0' : 'opacity-100 ml-2'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Nav Footer */}
      <div className="bg-[#2c3e50] rounded-2xl p-4 flex items-center">
        <img 
          src="https://gravatar.com/avatar/4474ca42d303761c2901fa819c4f2547" 
          alt="Avatar" 
          className="w-10 h-10 rounded-full"
        />
        {(isExpanded || isMobile) && (
          <div className="ml-3">
            <a href="https://codepen.io/uahnbu/pens/public" className="text-[#f5f6fa]">
              uahnbu
            </a>
            <span className="block text-[#8392a5] text-xs">Admin</span>
          </div>
        )}
        <FontAwesomeIcon icon={faCaretUp} className="ml-auto text-white" />
      </div>
    </div>
  );
};

export default Sidebar;
