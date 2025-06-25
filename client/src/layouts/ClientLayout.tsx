import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Home, FileText, DollarSign, LogOut, Menu, X } from "lucide-react";
import ClientDashboard from "@/pages/Client/ClientDashboard";

export default function ClientLayout() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log("Navigated to", location);

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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Client Portal</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${
                      item.current ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Logout */}
            <div className="hidden md:flex items-center">
              <Link href="/client/logout" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                        item.current
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        item.current ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
                <Link 
                  href="/client/logout" 
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorBoundary>
          <ClientDashboard />
        </ErrorBoundary>
      </main>
    </div>
  );
}