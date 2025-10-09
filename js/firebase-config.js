import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyCYhe3cD0b1sYErXMlYmXpH6mxHcXB6mNY",
    authDomain: "testvix-8e5b4.firebaseapp.com",
    databaseURL: "https://testvix-8e5b4-default-rtdb.firebaseio.com",
    projectId: "testvix-8e5b4",
    storageBucket: "testvix-8e5b4.firebasestorage.app",
    messagingSenderId: "1015945949026",
    appId: "1:1015945949026:web:8e11f8e7f0e0aff6c4fa9d"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
