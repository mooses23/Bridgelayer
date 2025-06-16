import { NavLink, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Home, FileText, DollarSign, LogOut } from "lucide-react";

export default function ClientLayout() {
  const location = useLocation();

  console.log("Navigated to", location.pathname);

  const navigation = [
    { name: "Dashboard", href: "/client/dashboard", icon: Home, current: location.pathname === "/client/dashboard" },
    { name: "Invoices", href: "/client/invoices", icon: DollarSign, current: location.pathname === "/client/invoices" },
    { name: "Documents", href: "/client/documents", icon: FileText, current: location.pathname === "/client/documents" },
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
                  <NavLink 
                    key={item.name} 
                    to={item.href}
                    className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${
                      item.current ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="flex items-center">
              <NavLink to="/client/logout" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </NavLink>
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