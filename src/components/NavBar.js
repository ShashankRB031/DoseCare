import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-lg rounded-b-2xl px-8 py-4 flex items-center justify-between">
      <div className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
        <span>DoseCare</span>
        <span className="text-2xl animate-bounce">💊</span>
      </div>
      <div className="flex gap-6 items-center">
        <Link
          to="/"
          className={`font-medium transition relative ${
            isActive("/") ? "text-blue-600" : "text-gray-700"
          } hover:text-blue-600`}
        >
          Home
          {isActive("/") && (
            <span className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded"></span>
          )}
        </Link>
        <Link
          to="/login"
          className={`font-medium transition ${
            isActive("/login") ? "text-blue-600" : "text-gray-700"
          } hover:text-blue-600`}
        >
          Login
        </Link>
        <Link
          to="/register"
          className={`font-medium transition ${
            isActive("/register") ? "text-blue-600" : "text-gray-700"
          } hover:text-blue-600`}
        >
          Register
        </Link>
      </div>
    </nav>
  );
} 