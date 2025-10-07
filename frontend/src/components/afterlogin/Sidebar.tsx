"use client";
import Link from "next/link";
import { SetStateAction, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Brain,
  Activity,
  Settings,
  User,
  BarChart2,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("mytrades");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "chart",
      label: "Chart",
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      id: "mytrades",
      label: "My Trades",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "option",
      label: "Options",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: "aisuggestion",
      label: "AI Suggestions",
      icon: <Brain className="w-5 h-5" />,
      badge: "Powered by Gemini",
      special: true,
    },
  ];

  // Add admin link
  if (session?.user?.email === "pinjaridastageer@gmail.com") {
    sidebarItems.push({
      id: "admin",
      label: "Admin Panel",
      icon: <Shield className="w-5 h-5" />,
      badge: "Admin",
      special: true,
    });
  }

  const handleLinkClick = (id: SetStateAction<string>) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-2 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-3 h-3 text-gray-700" />
        ) : (
          <Menu className="w-3 h-3 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-72 bg-white shadow-sm border-r rounded-lg border-gray-200 
          min-h-screen overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:ml-1
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nivesh Now</h1>
              <p className="text-xs text-gray-600">Smart Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                href={item.id}
                className={`group w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? item.special
                      ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm"
                      : "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`transition-colors ${
                        activeTab === item.id
                          ? item.special
                            ? "text-purple-600"
                            : "text-green-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {/* Special badge for AI Suggestions */}
                  {item.badge && (
                    <span
                      className={`px-2 py-1 ml-7 text-xs font-light rounded-full ${
                        activeTab === item.id
                          ? "bg-purple-100 text-purple-700"
                          : "hidden bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* AI Features Section */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-900">
                AI Features
              </h3>
            </div>
            <p className="text-xs text-purple-700 mb-3">
              Smart recommendations powered by advanced AI
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Live market analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Risk assessment</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Strategy optimization</span>
              </div>
            </div>
          </div>

          {/* Settings Link */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="ml-4 mb-4 pb-4">
          <div className="text-black">
            {session?.user?.name && (
              <p className="font-semibold text-xl mb-2">{session.user.name}</p>
            )}

            <button
              className="bg-blue-500 text-white px-3 py-2 cursor-pointer rounded text-sm hover:bg-blue-600 transition-colors"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
