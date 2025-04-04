
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase, { isConfigValid } from '@/lib/supabase';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check for user session if Supabase is properly configured
    if (isConfigValid) {
      // Check for current user session
      const checkUser = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);
        } catch (error) {
          console.error('Error checking authentication status:', error);
        } finally {
          setLoading(false);
        }
      };

      checkUser();

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        // Clean up subscription
        authListener.subscription.unsubscribe();
      };
    } else {
      // If Supabase is not configured, we're not loading
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (isConfigValid) {
        await supabase.auth.signOut();
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">VibeEventFlow</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Events
              </Link>
              {isConfigValid && user && (
                <Link
                  to="/admin"
                  className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : isConfigValid && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hi, {user.user_metadata?.username || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
