import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Building2,
  Link as LinkIcon,
  FileText,
  Brain,
  Eye,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useSession } from "@/lib/auth";

// Define our navigation items
const navigation = [
  { name: "Home", href: "/admin", icon: Home, description: "System overview" },
  { name: "Firms", href: "/admin/firms", icon: Building2, description: "Firm management" },
  { name: "Integrations", href: "/admin/integrations", icon: LinkIcon, description: "Third-party connections" },
  { name: "Agents", href: "/admin/agents", icon: FileText, description: "Document agent configuration" },
  { name: "LLM", href: "/admin/llm", icon: Brain, description: "Agent workflow designer" },
  { name: "VR", href: "/admin/vr", icon: Eye, description: "Firm workspace simulation" },
  { name: "Settings", href: "/admin/settings", icon: Settings, description: "System configuration" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useSession();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Sidebar for desktop/tablet */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FIRMSYNC</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md 
                    transition-colors cursor-pointer
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive 
                        ? 'text-blue-500' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@firmsync.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-gray-500 rounded-md"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-bold text-gray-900">FIRMSYNC</h1>
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
