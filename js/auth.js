/* Shared Firebase Authentication System */

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDwEDp5SfrxeEntOJg_XzbiBoGc9ADbX5g",
  authDomain: "vixvvowebsite.firebaseapp.com",
  projectId: "vixvvowebsite",
  storageBucket: "vixvvowebsite.appspot.com",
  messagingSenderId: "862620702799",
  appId: "1:862620702799:web:d06c0ec4e7b0f3010d323a",
  measurementId: "G-VX36JF6PTT",
  databaseURL: "https://vixvvowebsite-default-rtdb.firebaseio.com"
};

// Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// Keep user logged in across page refreshes
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Check if user is admin
async function checkAdminStatus(user) {
  if (!user) return false;
  
  try {
    const snapshot = await db.ref(`users/${user.uid}/role`).once('value');
    const role = snapshot.val();
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Global auth state listener
let currentUser = null;
let isUserAdmin = false;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  
  if (user) {
    isUserAdmin = await checkAdminStatus(user);
    console.log('User logged in:', user.email, '| Admin:', isUserAdmin);
    
    // Update UI across all pages
    updateAuthUI(user, isUserAdmin);
  } else {
    isUserAdmin = false;
    console.log('User logged out');
    updateAuthUI(null, false);
  }
});

// Update UI elements based on auth state
function updateAuthUI(user, isAdmin) {
  const loginBtn = document.getElementById('btnLogin');
  
  if (loginBtn) {
    if (user) {
      loginBtn.textContent = isAdmin ? 'Logout' : `Logout (${user.email.split('@')[0]})`;
    } else {
      loginBtn.textContent = 'Login';
    }
  }
  
  // Show/hide admin-only buttons
  const adminButtons = document.querySelectorAll('[data-admin-only]');
  adminButtons.forEach(btn => {
    btn.style.display = isAdmin ? 'inline-block' : 'none';
  });
  
  // Show/hide member-only content
  const memberContent = document.querySelectorAll('[data-member-only]');
  memberContent.forEach(el => {
    el.style.display = user ? 'block' : 'none';
  });
  
  // Trigger custom event for page-specific handlers
  window.dispatchEvent(new CustomEvent('authStateChanged', {
    detail: { user, isAdmin }
  }));
}

// Login function
async function login(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    
    // Reload the page to fetch all user data and initialize properly
    window.location.reload();
    
    return { success: true };
  } catch (error) {
    let message = 'Login failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address.';
    }
    
    return { success: false, error: message };
  }
}

// Send verification code
async function sendVerificationCode(email) {
  try {
    const sendCode = firebase.functions().httpsCallable('sendVerificationCode');
    const result = await sendCode({ email });
    return { success: true, message: result.data.message };
  } catch (error) {
    console.error('Error sending verification code:', error);
    
    let errorMessage = 'Failed to send verification code';
    
    // Check for "already exists" errors in multiple ways
    if (error.code === 'already-exists' || 
        (error.message && error.message.toLowerCase().includes('already registered'))) {
      errorMessage = 'This email is already registered. Please login instead.';
    } else if (error.message && error.message.toLowerCase().includes('already')) {
      errorMessage = 'This email is already registered. Please login instead.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

// Verify the code
async function verifyEmailCode(email, code) {
  try {
    const verifyCode = firebase.functions().httpsCallable('verifyCode');
    const result = await verifyCode({ email, code });
    return { success: true, message: result.data.message };
  } catch (error) {
    console.error('Error verifying code:', error);
    let message = 'Verification failed';
    
    if (error.code === 'deadline-exceeded') {
      message = 'Code has expired. Please request a new one.';
    } else if (error.code === 'invalid-argument') {
      message = 'Invalid verification code.';
    } else if (error.code === 'not-found') {
      message = 'No verification code found. Please request a new one.';
    }
    
    return { success: false, error: message };
  }
}

// Signup function (now requires verified email)
async function signup(email, password) {
  try {
    // Check if email was verified
    const verificationRef = db.ref(`verificationCodes/${email.replace(/\./g, ',')}`);
    const snapshot = await verificationRef.once('value');
    const verificationData = snapshot.val();
    
    if (!verificationData || !verificationData.verified) {
      return { success: false, error: 'Email not verified. Please verify your email first.' };
    }
    
    // Create the account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Automatically assign "member" role
    await db.ref(`users/${user.uid}`).set({
      email: email,
      role: 'member',
      createdAt: new Date().toISOString(),
      emailVerified: true
    });
    
    // Clean up verification code
    await verificationRef.remove();
    
    return { success: true };
  } catch (error) {
    let message = 'Signup failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already registered. Please login.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak (min 6 characters).';
    }
    
    return { success: false, error: message };
  }
}

// Logout function
async function logout() {
  try {
    await auth.signOut();
    
    // Reload the page to clear all user data and reset state
    window.location.reload();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Logout failed.' };
  }
}

// Export for use in other scripts
window.vixvvoAuth = {
  auth,
  db,
  login,
  signup,
  logout,
  sendVerificationCode,
  verifyEmailCode,
  getCurrentUser: () => currentUser,
  isAdmin: () => isUserAdmin
};
