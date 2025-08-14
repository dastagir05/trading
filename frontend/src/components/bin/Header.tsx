import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Nivesh Now
              </span>
            </div>

            <nav className="hidden md:flex space-x-6 ml-8">
              <button className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg font-medium">
                Portfolio
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg font-medium">
                Orders
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg font-medium">
                Mutual Funds
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg font-medium">
                IPO
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks, mutual funds..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <Settings className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Rajesh Kumar</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
