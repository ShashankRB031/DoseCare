// dosecare/src/components/HomePage.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const healthTips = [
  "Stay hydrated and take your medicines on time!",
  "A healthy outside starts from the inside.",
  "Consistency is key to effective medication.",
  "Your health is your wealth. Take care of it!",
  "Small steps every day lead to big results."
];
const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

export default function HomePage() {
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-green-100 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center bg-no-repeat -mt-16">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg text-center mb-4">Welcome to DoseCare</h1>
      <p className="text-lg text-gray-700 max-w-xl text-center mb-6">
        Your personal medicine and dose management assistant. Track, schedule, and never miss a dose again!
      </p>
      <p className="text-xl text-blue-700 font-bold text-center mb-6">
        Welcome, {user?.displayName || user?.email}!
      </p>
      {/* Health Tip */}
      <div className="w-full flex items-center justify-center mb-8">
        <div className="bg-gradient-to-r from-green-100 to-blue-100 text-blue-700 rounded-xl px-6 py-3 shadow font-semibold text-base italic animate-fade-in-slow">
          <span className="mr-2">💡</span>{randomTip}
        </div>
      </div>
      <Link to="/doses" className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-bold px-10 py-3 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200">
        Go to Dashboard
      </Link>
      {/* Animations */}
      <style>{`
        .animate-fade-in-slow { animation: fadeIn 2.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}