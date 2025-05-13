import React from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  return (
    <nav className="relative z-20 py-4 px-2 sm:px-6 mb-8 border-b-2 border-cyan-400">
      <div className="flex items-center justify-between">
        <div className="text-4xl font-black tracking-wider cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 neon-text">
          <Link to="/" className="hover:text-pink-400 transition-all duration-300 hover:scale-105 transform inline-block">
            ACS·QUIZZ
          </Link>
        </div>
        
        <ul className="flex items-center">
          {user && (
            <li className="relative">
              <Link to="/profile" className="block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 animate-pulse"></div>
                  <img
                    src={
                      `https://cdn.discordapp.com/avatars/${user?.discordId}/${user?.avatar}.png` ||
                      "/default-profile.png"
                    }
                    alt="Profile"
                    className="relative w-12 h-12 rounded-full border-2 border-cyan-400 hover:border-pink-400 transition-all duration-200 p-0.5 bg-black"
                  />
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;