import React from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  return (
    <nav className="relative z-20 py-4 px-2 sm:px-6 mb-8">
      {/* Optionnel: léger fond translucide pour détacher la navbar */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm border-b border-cyan-700 opacity-50"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="text-4xl font-black tracking-wider cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 neon-text-strong">
          <Link to="/" className="hover:text-pink-300 transition-all duration-300 hover:scale-105 transform inline-block">
            ACS·QUIZZ
          </Link>
        </div>
        
        <ul className="flex items-center">
          {user && (
            <li className="relative">
              <Link to="/profile" className="block">
                <div className="relative group">
                  {/* Halo pulsant plus subtil ou différent */}
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 opacity-60 group-hover:opacity-100 blur-sm animate-pulse group-hover:animate-none transition-opacity duration-300"></div>
                  <img
                    src={
                      `https://cdn.discordapp.com/avatars/${user?.discordId}/${user?.avatar}.png` ||
                      "/default-profile.png"
                    }
                    alt="Profile"
                    className="relative w-12 h-12 rounded-full border-2 border-cyan-600 group-hover:border-pink-400 transition-all duration-300 p-0.5 bg-gray-900" // Fond de l'image plus sombre
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