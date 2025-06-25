export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Analysis</h2>
          <p className="legal-slate mt-1">Upload and analyze legal documents with AI assistance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm legal-slate">
            <div className="w-2 h-2 legal-emerald bg-legal-emerald rounded-full"></div>
            <span>API Connected</span>
          </div>
          <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
