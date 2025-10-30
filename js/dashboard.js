// Initialize Firebase (compat version)
const firebaseConfig = {
  apiKey: "AIzaSyDwEDp5SfrxeEntOJg_XzbiBoGc9ADbX5g",
  authDomain: "vixvvowebsite.firebaseapp.com",
  projectId: "vixvvowebsite",
  storageBucket: "vixvvowebsite.firebasestorage.app",
  messagingSenderId: "862620702799",
  appId: "1:862620702799:web:d06c0ec4e7b0f3010d323a",
  measurementId: "G-VX36JF6PTT",
  databaseURL: "https://vixvvowebsite-default-rtdb.firebaseio.com"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Handle Google Maps API errors
window.gm_authFailure = function() {
  console.error('Google Maps authentication failed. Check API key and restrictions.');
};

// Initialize Google Maps callback
window.initGoogleMaps = function() {
  console.log('Google Maps API loaded successfully');
  // Add any Maps initialization code here if needed
};
