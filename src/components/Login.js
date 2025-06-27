import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Password reset email sent! Check your inbox.");
    } catch (err) {
      setResetMsg(err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 overflow-auto">
        {/* Floating icons for premium effect */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-green-300 rounded-full opacity-20 blur-2xl animate-pulse z-0"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-green-300 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse z-0"></div>
        <div className="relative z-10 w-full max-w-xs mx-auto">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-2 animate-fade-in">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-400 to-green-400 bg-clip-text text-transparent mb-1 drop-shadow flex items-center gap-2">
              <span>DoseCare</span>
              <span className="animate-bounce">💊</span>
            </h1>
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-2">
              <input
                className="border border-blue-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-sm transition placeholder:text-gray-400"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="border border-blue-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-sm transition placeholder:text-gray-400"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <div
                className="relative flex items-center justify-center mt-1"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ minHeight: 40, minWidth: 220 }}
              >
                <span
                  className={`absolute left-0 transition-all duration-700 ease-in-out ${
                    hovered
                      ? 'translate-x-10 opacity-100 scale-110 rotate-[-20deg]'
                      : '-translate-x-24 opacity-0 scale-75 rotate-0'
                  }`}
                  style={{ fontSize: "1.5rem", top: '50%', transform: 'translateY(-50%)' }}
                  role="img"
                  aria-label="pill"
                >
                  💊
                </span>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 text-base relative z-10 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Login
                </button>
                <span
                  className={`absolute right-0 transition-all duration-700 ease-in-out ${
                    hovered
                      ? '-translate-x-10 opacity-100 scale-110 rotate-[15deg]'
                      : 'translate-x-24 opacity-0 scale-75 rotate-0'
                  }`}
                  style={{ fontSize: "1.5rem", top: '50%', transform: 'translateY(-50%)' }}
                  role="img"
                  aria-label="water glass"
                >
                  🥛
                </span>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-white/90 border border-gray-300 hover:bg-blue-50 text-gray-700 font-semibold p-2 rounded-xl shadow transition-all duration-200 text-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
                Continue with Google
              </button>
              <button
                type="button"
                className="text-blue-600 hover:underline text-xs mt-2"
                onClick={() => setShowReset(v => !v)}
              >
                Forgot Password?
              </button>
              {error && <p className="text-red-500 text-center text-xs mt-1">{error}</p>}
            </form>
            {showReset && (
              <form onSubmit={handlePasswordReset} className="mt-4 flex flex-col gap-2 bg-blue-50 p-3 rounded">
                <label className="text-xs font-medium text-gray-700">Enter your email to reset password:</label>
                <input
                  type="email"
                  className="border border-blue-300 rounded-md p-2 text-sm"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
                >
                  Send Reset Email
                </button>
                {resetMsg && <div className="text-xs text-green-600 mt-1">{resetMsg}</div>}
              </form>
            )}
            <p className="mt-1 text-center text-gray-600 text-xs">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">Register</Link>
            </p>
          </div>
        </div>
        {/* Animations */}
        <style>{`
          .animate-fade-in { animation: fadeIn 1.2s ease; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    </>
  );
}