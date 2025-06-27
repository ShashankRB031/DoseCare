import React, { useState } from "react";
import { Link } from "react-router-dom";

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-green-100">
      {/* Responsive Sticky NavBar for Landing Page */}
      <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur flex items-center justify-between px-4 py-3 shadow-md border-b border-blue-100">
        {/* Logo or Home */}
        <button onClick={() => scrollToSection('home')} className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent select-none">DoseCare</button>
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
        <div className={`flex-col md:flex-row md:flex gap-6 font-semibold absolute md:static top-14 left-0 w-full md:w-auto bg-white/95 md:bg-transparent shadow-lg md:shadow-none rounded-b-xl md:rounded-none transition-all duration-300 ${menuOpen ? 'flex' : 'hidden'} md:flex`}>
          <button onClick={() => {scrollToSection('home'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">Home</button>
          <button onClick={() => {scrollToSection('what'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">What is DoseCare?</button>
          <button onClick={() => {scrollToSection('how'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">How It Works</button>
          <button onClick={() => {scrollToSection('features'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">Features</button>
          <button onClick={() => {scrollToSection('testimonials'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">Testimonials</button>
          <button onClick={() => {scrollToSection('faq'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">FAQ</button>
          <button onClick={() => {scrollToSection('contact'); setMenuOpen(false);}} className="hover:text-blue-600 transition py-2 md:py-0">Contact</button>
        </div>
      </nav>
      {/* Hero Section */}
      <section id="home" className="flex flex-col items-center justify-center min-h-[60vh] px-4 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
            DoseCare
          </h1>
          <span className="text-5xl animate-bounce">💊</span>
        </div>
        <p className="text-2xl text-gray-700 mb-4 max-w-2xl mx-auto">
          Your personal medication management assistant.<br />
          <span className="text-blue-500 font-semibold">Never miss a dose again!</span><br />  
          <span className="text-green-600 font-semibold">Now with an AI Health Chat Assistant for instant symptom advice!</span>
        </p>
        <Link
          to="/login"
          className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-bold px-10 py-4 rounded-full text-xl shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Get Started
        </Link>
      </section>

      {/* What is DoseCare */}
      <section id="what" className="max-w-3xl mx-auto my-12 px-4 animate-slide-up">
        <h2 className="text-3xl font-bold text-blue-700 mb-2">What is DoseCare?</h2>
        <p className="text-gray-700 text-lg mb-4">
          DoseCare is a secure, easy-to-use web app that helps you manage your medicines, schedule reminders, and track your medication history. Whether you're managing your own health or caring for a loved one, DoseCare keeps you on track and in control.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 mb-2">
          <h3 className="text-xl font-semibold text-blue-600 mb-1">Our Mission</h3>
          <p className="text-gray-700">To empower everyone to take control of their health by making medication management simple, reliable, and stress-free.</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="text-xl font-semibold text-green-600 mb-1">Why DoseCare?</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Easy to use for all ages</li>
            <li>Secure and private</li>
            <li>Works on any device</li>
          </ul>
        </div>
      </section>

      {/* About the AI Health Assistant */}
      <section className="max-w-3xl mx-auto my-12 px-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">About the AI Health Chat Assistant</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our built-in AI Health Chat Assistant is here to help you take early precautions for common health issues like cough, cold, headache, and body pain. Just click the doctor chat icon at the bottom-right corner and describe your symptoms. The assistant will instantly provide basic advice, home remedies, and guidance on when to seek medical attention. Your privacy is protected—no data leaves your device.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 mb-2">
          <h3 className="text-lg font-semibold text-blue-600 mb-1">How does it help?</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Quick, reliable advice for common symptoms</li>
            <li>Easy access—just one click away on every page</li>
            <li>Empowers you to take early action and stay healthy</li>
          </ul>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 mt-4">
          <p className="text-yellow-700 font-semibold">
            <strong>Disclaimer:</strong> Always consult a qualified healthcare professional before starting any treatment or medication. The AI Health Chat Assistant is for informational purposes only and does not replace medical advice. Take all medicines and treatments under the guidance of your doctor.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-12 bg-gray-50 animate-fade-in mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start justify-items-center">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-200 text-blue-700 rounded-full w-20 h-20 flex items-center justify-center text-3xl mb-3 shadow-lg">📝</div>
              <h3 className="font-semibold mb-1">Register</h3>
              <p className="text-gray-600 text-sm">Create your secure DoseCare account</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-200 text-green-700 rounded-full w-20 h-20 flex items-center justify-center text-3xl mb-3 shadow-lg">💊</div>
              <h3 className="font-semibold mb-1">Add Medicines</h3>
              <p className="text-gray-600 text-sm">Enter your medicines, dosage, and schedule</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-200 text-yellow-700 rounded-full w-20 h-20 flex items-center justify-center text-3xl mb-3 shadow-lg">⏰</div>
              <h3 className="font-semibold mb-1">Set Reminders</h3>
              <p className="text-gray-600 text-sm">Schedule reminders for each dose</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-pink-200 text-pink-700 rounded-full w-20 h-20 flex items-center justify-center text-3xl mb-3 shadow-lg">🔔</div>
              <h3 className="font-semibold mb-1">Get Notified</h3>
              <p className="text-gray-600 text-sm">Receive sound and popup notifications when it's time</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-20 h-20 flex items-center justify-center text-3xl mb-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v10.5A2.25 2.25 0 009.75 19.5h4.5a2.25 2.25 0 002.25-2.25V13.5M12 15.75l3-3m0 0l-3-3m3 3H9" /></svg>
              </div>
              <h3 className="font-semibold mb-1">Dose History & Export</h3>
              <p className="text-gray-600 text-sm">Filter and download your dose history as PDF for your records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto my-12 px-4 animate-slide-up">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {["Secure registration and login",
            "Add medicines with dosage and timing",
            "Schedule reminders for each dose",
            "Sound + popup notifications",
            "View history of taken medicines",
            'Mark doses as "Taken"',
            "Simple, clean, and mobile-friendly design",
            "Apply Filters and Export your filtered history PDF ",
            "AI Health Chat Assistant for quick symptom advice"
          ].map((feature, i) => (
            <div key={i} className="flex items-center bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
              <span className="text-green-500 text-2xl mr-3">✔️</span>
              <span className="text-lg text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-4xl mx-auto my-12 px-4 animate-fade-in">
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🌟</span>
            <p className="text-gray-700 italic mb-2">“DoseCare has made it so easy to remember my medicines. I feel more in control of my health!”</p>
            <span className="font-semibold text-blue-600">— Devika, 22</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🌟</span>
            <p className="text-gray-700 italic mb-2">
              “I use DoseCare for my parents. The reminders are a lifesaver!<br/>
              It gives me peace of mind knowing they never miss a dose.<br/>
            
            </p>
            <span className="font-semibold text-blue-600">— Nishanth, 41</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🌟</span>
            <p className="text-gray-700 italic mb-2">
              “DoseCare keeps me on track with my daily medicines.<br/>
              The reminders are always on time and easy to follow.<br/>
              
            </p>
            <span className="font-semibold text-blue-600">— Rukku, 27</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto my-12 px-4 animate-slide-up">
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-blue-600">Is DoseCare free?</h3>
            <p className="text-gray-700">Yes! DoseCare is free to use for everyone.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-blue-600">Can I use DoseCare on my phone?</h3>
            <p className="text-gray-700">Absolutely. DoseCare is fully responsive and works on any device.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-blue-600">Is my data private?</h3>
            <p className="text-gray-700">Yes, your data is encrypted and never shared with third parties.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-blue-600">What is the AI Health Chat Assistant?</h3>
            <p className="text-gray-700">The AI Health Chat Assistant is a built-in feature that provides instant advice for common symptoms like cough, cold, headache, and more. It uses a simple rule-based system to offer home remedies and guidance, and does not share your data with anyone. <span className="block mt-2 text-yellow-700 font-semibold">Always consult your doctor before taking any medicines or starting treatment. The AI Health Chat Assistant does not replace professional medical advice.</span></p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto my-12 px-4 animate-fade-in">
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Contact Us</h2>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <p className="text-gray-700 mb-4">Have questions or feedback? We'd love to hear from you!</p>
          <a href="mailto:rbshashank17@email.com" className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-bold px-8 py-3 rounded-full text-lg shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200">
            Email Us
          </a>
          <p className="mt-4 text-gray-700 text-sm text-center">
            Or email us at: <a href="mailto:rbshashank17@email.com" className="text-blue-600 underline break-all">rbshashank17@email.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-50 border-t text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DoseCare. Made with <span className="text-pink-500">❤️</span> for your health.
        <div className="mt-2">
          Developed by <span className="font-semibold text-blue-700">Shashank R B</span>
        </div>
      </footer>

      {/* Animations */}
      <style>
        {`
          body { margin: 0; }
          .animate-fade-in { animation: fadeIn 1.2s ease; }
          .animate-slide-up { animation: slideUp 1.2s cubic-bezier(.4,2,.6,1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </div>
  );
}
