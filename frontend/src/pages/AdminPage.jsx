import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Sidebar />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Admin</h1>
      </div>
    </div>
  );
};

export default AdminPage;