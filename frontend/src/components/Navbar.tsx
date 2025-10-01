"use client";
import React from "react";
import Link from "next/link";
// import { Search } from "lucide-react";
import { Search } from "lucide-react";
import { TrendingUp } from "lucide-react";
import Login from "./Login";
import { useState } from "react";
const Navbar = () => {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <>
      <header className="fixed top-0 left-0 w-full  z-10 bg-white ">
        <div className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-5 items-center">
            <h1 className="text-3xl font-bold ">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">Nivesh Now</span>
              </div>
            </h1>
            <nav className="hidden md:flex space-x-8 text-md text-gray-500 font-semibold">
              <Link href="/more">Stock</Link>
              <Link href="/more">F&O</Link>
              <Link href="/more">Mutual Funds</Link>
              <Link href="/more">More</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 border border-gray-200 rounded-lg px-4 py-2">
              <Search size={"16px"} strke-width={"1px"} />
              <input type="text" placeholder="Search Nifty..." />
              <p className="text-sm text-gray-500">Ctrl+K</p>
            </div>
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
