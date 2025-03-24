import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const UserPage = () => {
    
  return (
    
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        
        <Sidebar />
        <Navbar />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome User</h1>
      </div>
    </div>
  );
};

export default UserPage;