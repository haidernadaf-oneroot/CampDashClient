// TOPBAR COMPONENT
import React, { useEffect, useState } from "react";
import { User } from "lucide-react";

const Topbar = () => {
  const [agentName, setAgentName] = useState("Username");

  useEffect(() => {
    const name = localStorage.getItem("agentName");
    console.log("Topbar reading agentName:", name);
    if (name) setAgentName(name);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-purple-950 shadow-md flex items-center px-6 left-48">
      <h1 className="text-lg font-semibold text-white">Dashboard</h1>

      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white">
          <User size={22} />
          <span className="text-sm font-medium">{agentName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
