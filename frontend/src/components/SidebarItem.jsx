import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SidebarItem = ({ to, icon, label }) => {
  return (
    <motion.li 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center space-x-3"
    >
      <span className="text-lg">{icon}</span>
      <Link to={to} className="text-md">{label}</Link>
    </motion.li>
  );
};

export default SidebarItem;
