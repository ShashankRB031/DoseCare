// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyALTber9xylt645EjNxW6Y3Pk0RsYIzq0E",
  authDomain: "dosecare-bd255.firebaseapp.com",
  projectId: "dosecare-bd255",
  storageBucket: "dosecare-bd255.appspot.com",
  messagingSenderId: "449344288461",
  appId: "1:449344288461:web:ce4bea608de3ded0bd5b84"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/logo192.png'
    }
  );
});

const stopSound = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
};

self.addEventListener('push', function(event) {
  const data = event.data.json();
  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: '/logo192.png'
  });
});
