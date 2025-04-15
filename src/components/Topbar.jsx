import React from "react";
import { LogOut, User } from "lucide-react"; // Modern icons

const Topbar = () => {
  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-green-800 shadow-md transition-all duration-300 ease-in-out flex items-center px-6 left-48">
      {/* Page Name */}
      <h1 className="text-lg font-semibold text-white">Dashboard</h1>

      {/* User Info & Logout */}
      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white">
          <User size={22} />
          <span className="text-sm font-medium">Username</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            window.location.href = "/auth"; // Force redirect
          }}
          className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
