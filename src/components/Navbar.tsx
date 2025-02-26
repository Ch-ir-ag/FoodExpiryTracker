'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { user } = useAuth();
  
  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Food</span>
              <span className="text-2xl font-bold text-gray-900">Tracker</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer"
              >
                How it Works
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => scrollToSection('signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 