import { useState } from "react";
import { 
  Home, 
  FileText, 
  Settings, 
  MessageSquare, 
  Users, 
  Building2,
  Menu,
  X,
  Search,
  BarChart3,
  CreditCard,
  UserCheck,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import NotificationBell from "@/components/NotificationBell";
import { useTenantSafe } from '@/hooks/useTenantSafe';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export default function Layout({ children, currentView = 'dashboard', onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use tenant data from TenantContext instead of direct API call
  const { tenant: firm } = useTenantSafe();

  // Fetch message threads for unread count
  const { data: threads } = useQuery({
    queryKey: ["/api/message-threads"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/message-threads");
        if (!res.ok) throw new Error('Failed to fetch threads');
        return res.json();
      } catch (error) {
        console.error('Error fetching threads:', error);
        return [];
      }
    },
    retry: false
  });

  const unreadCount = threads?.filter((thread: any) => !thread.isResolved).length || 0;

  const navigation = [
    { name: "Dashboard", id: "dashboard", icon: Home },
    { name: "Clients", id: "clients", icon: Users },
    { name: "Intake", id: "intake", icon: UserCheck },
    { name: "Documents", id: "documents", icon: FileText },
    { name: "Billing", id: "billing", icon: CreditCard },
    { name: "Calendar", id: "calendar", icon: Calendar },
    { name: "Settings", id: "settings", icon: Settings },
  ];

  const isActive = (id: string) => currentView === id;

  const handleNavigation = (id: string) => {
    setSidebarOpen(false);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and firm info */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">FIRMSYNC</span>
                <span className="text-xs text-gray-500 truncate max-w-32">
                  {firm?.name || "Loading..."}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.id);
              return (
                <button 
                  key={item.name} 
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                    ${active 
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${active ? "text-blue-600" : ""}`} />
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
                <p className="text-xs text-gray-500">Firm Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10 w-64 lg:w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <div className="text-sm text-gray-600">
                <span className="hidden sm:inline">Plan: </span>
                <Badge variant="outline" className="capitalize">
                  {firm?.plan || "Loading..."}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}