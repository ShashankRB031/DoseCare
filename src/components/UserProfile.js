import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';

function getInitial(nameOrEmail) {
  if (!nameOrEmail) return '';
  return nameOrEmail.trim()[0].toUpperCase();
}

export default function UserProfile() {
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(auth.currentUser, { displayName });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { displayName }, { merge: true });

      navigate('/home');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (!user) {
    return <p className="p-2 text-center text-xs text-gray-600">Please log in to view your profile.</p>;
  }

  const initials = getInitial(user.displayName || user.email);
  const isDefaultGooglePhoto = user.photoURL && user.photoURL.includes('googleusercontent.com') && user.photoURL.includes('photo.jpg');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4">
      <div className="w-full max-w-sm mx-auto bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-4 flex flex-col items-center relative">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3 border-2 border-white">
          <span className="text-3xl">👤</span>
        </div>
        <h2 className="text-xl font-bold text-blue-700 mb-2 tracking-tight">Your Profile</h2>
        <form onSubmit={handleUpdateProfile} className="w-full flex flex-col gap-3 mt-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-sm cursor-not-allowed opacity-80"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-blue-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/80"
              placeholder="Your Name"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white text-sm font-semibold py-2 rounded-lg shadow-md transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Save Changes
          </button>
          {message && <p className="text-center text-green-600 text-xs font-medium mt-1">{message}</p>}
        </form>
      </div>
    </div>
  );
}
