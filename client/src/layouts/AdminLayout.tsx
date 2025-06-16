import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  Building2, 
  BarChart3, 
  Eye, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Home
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("Navigated to", location.pathname);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home, current: location.pathname === "/admin" },
    { name: "Firms", href: "/admin/firms", icon: Building2, current: location.pathname === "/admin/firms" },
    { name: "Usage Analytics", href: "/admin/usage", icon: BarChart3, current: location.pathname === "/admin/usage" },
    { name: "Ghost Mode", href: "/admin/ghost", icon: Eye, current: location.pathname === "/admin/ghost" },
    { name: "System Settings", href: "/admin/settings", icon: Settings, current: location.pathname === "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FIRMSYNC</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Admin</span>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.name} 
                  to={item.href}
                  className={({ isActive }) => `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Admin user menu */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">System Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@firmsync.com</p>
              </div>
              <NavLink to="/logout" className="ml-3 p-2 text-gray-400 hover:text-gray-500" title="Sign out">
                <LogOut className="w-4 h-4" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  System Administration
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}