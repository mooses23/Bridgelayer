import { Scale, FileText, History, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-legal-blue rounded-xl flex items-center justify-center">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FIRMSYNC</h1>
            <p className="text-sm legal-slate">AI Legal Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-legal-blue text-white rounded-lg">
              <FileText size={18} />
              <span className="font-medium">Document Analysis</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <History size={18} />
              <span>Recent Documents</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={18} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs legal-slate">
          <p className="font-medium">Powered by BridgeLayer</p>
          <p>v2.1.0 • Licensed to Law Firm XYZ</p>
        </div>
      </div>
    </div>
  );
}
