import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const location = useLocation();
  
  const getTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/upload":
        return "Upload Licenses";
      case "/email-templates":
        return "Email Configuration";
      case "/email-logs":
        return "Email Logs";
      case "/reports":
        return "Reports";
      case "/user-management":
        return "User & Company Management";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          {getTitle(location.pathname)}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 hidden md:block">
          Welcome,{" "}
          <span className="font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          !
          <span className="ml-2 text-xs text-gray-400">
            (Logged in: {user?.loginTime})
          </span>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
