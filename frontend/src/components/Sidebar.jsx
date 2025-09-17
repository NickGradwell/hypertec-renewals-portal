import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

const Sidebar = ({ user }) => {
  const location = useLocation();
  
  // Define all possible nav items with roles
  const allNavItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      path: "/",
      roles: [UserRole.HYPERTEC_ADMIN, UserRole.PARTNER, UserRole.CUSTOMER],
    },
    { 
      name: "Upload Licenses", 
      icon: "📤", 
      path: "/upload",
      roles: [UserRole.HYPERTEC_ADMIN, UserRole.PARTNER] 
    },
    { 
      name: "Email Templates", 
      icon: "✉️", 
      path: "/email-templates",
      roles: [UserRole.HYPERTEC_ADMIN, UserRole.PARTNER] 
    },
    { 
      name: "Email Logs", 
      icon: "📜", 
      path: "/email-logs",
      roles: [UserRole.HYPERTEC_ADMIN, UserRole.PARTNER] 
    },
    { 
      name: "Reports", 
      icon: "📊", 
      path: "/reports",
      roles: [UserRole.HYPERTEC_ADMIN, UserRole.PARTNER] 
    },
    { 
      name: "User Management", 
      icon: "👥", 
      path: "/user-management",
      roles: [UserRole.HYPERTEC_ADMIN] 
    },
    { 
      name: "Company Management", 
      icon: "🏢", 
      path: "/company-management",
      roles: [UserRole.HYPERTEC_ADMIN] 
    },
  ];

  // Filter nav items based on the current user's role
  const visibleNavItems = allNavItems.filter(
    (item) => user && user.role && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-blue-800 text-white flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="p-4 py-5 flex justify-center items-center border-b border-blue-700">
        <img
          src="https://www.hypertec.co.uk/wp-content/uploads/2023/08/Hypertec-Logo-White.svg"
          alt="Hypertec Logo"
          className="h-8 w-auto"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/150x40/1A237E/FFFFFF?text=Hypertec";
          }}
        />
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-3 transition-colors duration-150 ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-blue-700 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700 text-xs text-gray-400">
        Role: {user?.role || "N/A"}
      </div>
    </aside>
  );
};

export default Sidebar;
