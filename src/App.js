import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Medicines from "./components/Medicines";
// import ScheduleDose from "./components/ScheduleDose"; // remove if unused
import ScheduledDoses from "./components/ScheduledDoses";
import MedicineDoseManager from "./components/MedicineDoseManager";
import { auth, messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import UserProfile from "./components/UserProfile";
import MedicineAndSchedule from "./components/MedicineAndSchedule";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import AppNavBar from "./components/AppNavBar";
import DoseHistory from "./components/DoseHistory";
import HealthChatBot from './components/HealthChatBot';

function AppContent() {
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  // FCM Notification setup
  useEffect(() => {
    if (user && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey: "YOUR_VAPID_KEY" // Use your actual VAPID key here
          })
            .then((currentToken) => {
              if (currentToken && auth.currentUser) {
                setDoc(doc(db, "users", auth.currentUser.uid), {
                  fcmToken: currentToken
                }, { merge: true });
                console.log("FCM Token:", currentToken);
              }
            })
            .catch((err) => {
              console.log("An error occurred while retrieving token. ", err);
            });
        }
      });
    }

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo192.png' // or your app icon
        });
      }
    });
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check if we're on the landing page
  const isLandingPage = location.pathname === "/";

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <AppNavBar user={user} />
      <main className={`max-w-7xl mx-auto px-4 ${isLandingPage ? 'py-0' : 'py-10 mt-20'}`}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/medicines" element={<MedicineAndSchedule />} />
            <Route path="/schedule" element={<MedicineAndSchedule />} />
            <Route path="/doses" element={<ScheduledDoses />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<DoseHistory />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </main>
        <HealthChatBot />
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
