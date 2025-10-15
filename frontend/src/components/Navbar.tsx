"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import Login from "./Login";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/#" },
    { name: "F&O", href: "/#" },
    { name: "Chart", href: "/#" },
    { name: "AI Suggestion", href: "/#" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-20 backdrop-blur-md bg-white/70 shadow-sm border-b border-gray-200">
        <div className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo Section */}
          <div className="flex space-x-6 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-black">
                Nivesh Now
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex space-x-8 text-md font-semibold">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative transition-all ${
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-cyan-600"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-green-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search + Login */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setOpenDialog(true)}
              className="bg-green-700 px-4 py-2 rounded-lg font-semibold text-gray-100 text-md"
            >
              Login/Sign up
            </button>
          </div>
        </div>
      </header>

      <Login openDialog={openDialog} closeDialog={() => setOpenDialog(false)} />
    </>
  );
};

export default Navbar;
