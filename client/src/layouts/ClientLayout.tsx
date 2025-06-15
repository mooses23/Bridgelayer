import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Home, FileText, DollarSign, LogOut } from "lucide-react";

export default function ClientLayout() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/client/dashboard", icon: Home, current: location === "/client/dashboard" },
    { name: "Invoices", href: "/client/invoices", icon: DollarSign, current: location === "/client/invoices" },
    { name: "Documents", href: "/client/documents", icon: FileText, current: location === "/client/documents" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                      <Icon className={`mr-2 h-4 w-4 ${
                        item.current ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="flex items-center">
              <Link href="/client/logout">
                <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}