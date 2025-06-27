import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AppNavBar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  if (location.pathname === "/") return null; // Hide nav on landing page

  // Determine home route for logo and Home link
  const homeRoute = user ? "/home" : "/";

  // Helper for active link
  const isActive = (path) => location.pathname === path;

  // Underline classes for smooth animation
  const underline = "after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-0.5 after:w-2/3 after:h-1 after:rounded-full after:bg-gradient-to-r after:from-blue-400 after:to-green-400 after:content-[''] after:transition-all after:duration-300";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-md border-b border-blue-100 shadow-xl">
      {/* Logo (clickable) */}
      <Link
        to={homeRoute}
        className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-200"
        style={{ letterSpacing: "-1px" }}
      >
        DoseCare
      </Link>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-blue-600 mb-1 rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 mb-1 rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Nav Links */}
      <div className={`flex-col md:flex-row md:flex gap-5 items-center text-base font-medium absolute md:static top-14 left-0 w-full md:w-auto bg-white/90 md:bg-transparent shadow-lg md:shadow-none rounded-b-xl md:rounded-none transition-all duration-300 ${menuOpen ? 'flex' : 'hidden'} md:flex`}>
        <Link
          to={homeRoute}
          className={`relative px-2 py-1 transition-all duration-200 hover:text-blue-700 ${isActive("/home") || (isActive("/") && !user) ? `text-blue-700 font-bold ${underline}` : "text-gray-700"}`}
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        {user && (
          <>
            <Link
              to="/schedule"
              className={`relative px-2 py-1 transition-all duration-200 hover:text-blue-700 ${isActive("/schedule") ? `text-blue-700 font-bold ${underline}` : "text-gray-700"}`}
              onClick={() => setMenuOpen(false)}
            >
              Schedule Dose
            </Link>
            <Link
              to="/doses"
              className={`relative px-2 py-1 transition-all duration-200 hover:text-blue-700 ${isActive("/doses") ? `text-blue-700 font-bold ${underline}` : "text-gray-700"}`}
              onClick={() => setMenuOpen(false)}
            >
              My Doses
            </Link>
            <Link
              to="/history"
              className={`relative px-2 py-1 transition-all duration-200 hover:text-blue-700 ${isActive("/history") ? `text-blue-700 font-bold ${underline}` : "text-gray-700"}`}
              onClick={() => setMenuOpen(false)}
            >
              Dose History
            </Link>
            <Link
              to="/profile"
              className={`relative px-2 py-1 transition-all duration-200 hover:text-blue-700 ${isActive("/profile") ? `text-blue-700 font-bold ${underline}` : "text-gray-700"}`}
              onClick={() => setMenuOpen(false)}
              aria-label="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 align-middle">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="10" r="3" fill="currentColor" />
                <path d="M6 18c0-2.21 3.134-4 6-4s6 1.79 6 4" fill="currentColor" />
              </svg>
            </Link>
          </>
        )}
        {!user && <Link to="/register" className="px-2 py-1 rounded-lg hover:text-blue-700 text-gray-700 transition-all duration-200" onClick={() => setMenuOpen(false)}>Register</Link>}
        {!user && <Link to="/login" className="px-2 py-1 rounded-lg hover:text-blue-700 text-gray-700 transition-all duration-200" onClick={() => setMenuOpen(false)}>Login</Link>}
        {user && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white font-bold text-base shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
            onClick={() => signOut(auth)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}