/* Shared Firebase Authentication System */

// Note: Firebase is initialized in dashboard.js or index.html
// This file assumes Firebase is already initialized

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
    console.log('Login error code:', error.code);
    console.log('Login error message:', error.message);
    console.log('Full error object:', error);
    
    let message = 'Invalid email or password. Please try again.';
    
    // Handle all Firebase auth error codes
    if (error.code === 'auth/invalid-login-credentials') {
      message = 'Invalid email or password. Please check your credentials.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password. Please check your credentials.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your internet connection.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/password sign-in is not enabled. Please contact support.';
    } else if (error.code === 'auth/missing-password') {
      message = 'Please enter your password.';
    } else if (error.message && (error.message.includes('password') || error.message.includes('credential'))) {
      message = 'Invalid email or password. Please check your credentials.';
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

// Signup function (email verification disabled - direct signup)
async function signup(email, password) {
  try {
    // Create the account directly without email verification
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Automatically assign "member" role
    await db.ref(`users/${user.uid}`).set({
      email: email,
      role: 'member',
      createdAt: new Date().toISOString(),
      emailVerified: false
    });
    
    return { success: true };
  } catch (error) {
    console.log('Signup error code:', error.code);
    console.log('Signup error message:', error.message);
    
    let message = 'Signup failed. Please try again.';
    
    // Handle all Firebase auth error codes for signup
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Please login instead.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address format.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters long.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/password sign-up is not enabled. Please contact support.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your internet connection.';
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

// Password reset function
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { 
      success: true, 
      message: 'Password reset email sent! Check your inbox for instructions.' 
    };
  } catch (error) {
    console.log('Password reset error code:', error.code);
    console.log('Password reset error message:', error.message);
    
    let message = 'Failed to send reset email. Please try again.';
    
    // Handle all Firebase auth error codes for password reset
    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address format.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many reset attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your internet connection.';
    }
    
    return { success: false, error: message };
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
  resetPassword,
  getCurrentUser: () => currentUser,
  isAdmin: () => isUserAdmin
};
