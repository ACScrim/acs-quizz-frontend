import React from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth"; // Assurez-vous que ce hook existe et est correctement configuré.

const Navbar: React.FC = () => {
  const { user } = useAuth();
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ACS Quizz</Link>
      </div>
      <ul className="navbar-links">
        {user && (
          <li className="navbar-profile">
            <Link to="/profile">
              <img
                src={
                  `https://cdn.discordapp.com/avatars/${user?.discordId}/${user?.avatar}.png` ||
                  "/default-profile.png"
                }
                alt="Profile"
                className="profile-icon"
              />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
export default Navbar;
