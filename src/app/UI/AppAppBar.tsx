"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import Sankan from "/public/Sankan.svg";

export default function AppAppBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Twitter', href: 'https://twitter.com/' },
    { label: 'Meet the Dev', href: '/Company/Meet_Dev' },
    { label: 'Feedback', href: '/UI/FeedbackForm' },
  ];

  return (
    <header className="relative top-5 left-0 right-0 z-50 w-[90%] lg:w-[60%] ml-[5%] lg:ml-[20%] rounded-[40px]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between bg-white/40 backdrop-blur-lg rounded-full p-3 pl-5 pr-6 shadow-sm">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
               <Image alt="Logo" src={Sankan} width={45} height={45} style={{borderRadius:40, color:'white', padding:'3px', border:'2px solid lightgrey'}}/>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-white hover:text-black px-3 py-2 rounded-md text-black md:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/Authentication/login"
                className="text-sm text-white hover:text-black px-3 py-2 rounded-md"
              >
                Join
              </Link>
              <Link
                href="/Authentication/Signup"
                className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white hover:text-black"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-24 bg-black z-40 md:hidden">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={toggleMenu}
                    className="text-lg text-white hover:text-black"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-4 space-y-4">
                  <Link
                    href="/Authentication/login"
                    onClick={toggleMenu}
                    className="block text-lg text-white hover:text-black"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/Authentication/Signup"
                    onClick={toggleMenu}
                    className="block text-lg bg-[#7e22ce] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}