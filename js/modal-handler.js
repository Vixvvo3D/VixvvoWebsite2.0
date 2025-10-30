/* Shared Modal Handler for Auth Modals */

(function initializeModals() {
  // Get modal elements
  const modal = document.getElementById('modal');
  const signupModal = document.getElementById('signupModal');
  const verificationModal = document.getElementById('verificationModal');
  
  if (!modal || !signupModal) {
    // Modals might not be loaded yet if loaded dynamically
    return;
  }

  // Modal open/close functions
  window.openLoginModal = function() {
    modal.style.display = 'grid';
    clearLoginForm();
  };

  window.openSignupModal = function() {
    signupModal.style.display = 'grid';
    clearSignupForm();
  };

  window.closeAllModals = function() {
    modal.style.display = 'none';
    signupModal.style.display = 'none';
    if (verificationModal) verificationModal.style.display = 'none';
  };

  // Clear form functions
  function clearLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';
    const loginErr = document.getElementById('loginErr');
    if (loginErr) {
      loginErr.textContent = '';
      loginErr.style.display = 'none';
    }
  }

  function clearSignupForm() {
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPass').value = '';
    document.getElementById('signupPassConfirm').value = '';
    const signupErr = document.getElementById('signupErr');
    if (signupErr) {
      signupErr.textContent = '';
      signupErr.style.display = 'none';
    }
  }

  // Close buttons
  document.getElementById('doClose').addEventListener('click', function(e) {
    e.preventDefault();
    closeAllModals();
  });

  document.getElementById('doSignupClose').addEventListener('click', function(e) {
    e.preventDefault();
    closeAllModals();
  });

  // Switch between login and signup
  document.getElementById('signUpLink').addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'none';
    signupModal.style.display = 'grid';
    clearSignupForm();
  });

  document.getElementById('backToLoginLink').addEventListener('click', function(e) {
    e.preventDefault();
    signupModal.style.display = 'none';
    modal.style.display = 'grid';
    clearLoginForm();
  });

  // Click outside modal to close
  modal.addEventListener('click', function(e) {
    if (e.target.id === 'modal') {
      closeAllModals();
    }
  });

  signupModal.addEventListener('click', function(e) {
    if (e.target.id === 'signupModal') {
      closeAllModals();
    }
  });

  if (verificationModal) {
    verificationModal.addEventListener('click', function(e) {
      if (e.target.id === 'verificationModal') {
        closeAllModals();
      }
    });
  }

  // Password visibility toggles
  document.getElementById('toggleLoginPass').addEventListener('click', function(e) {
    e.preventDefault();
    const passInput = document.getElementById('loginPass');
    const toggleBtn = document.getElementById('toggleLoginPass');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passInput.type = 'password';
      toggleBtn.textContent = '👁';
    }
  });

  document.getElementById('toggleSignupPass').addEventListener('click', function(e) {
    e.preventDefault();
    const passInput = document.getElementById('signupPass');
    const toggleBtn = document.getElementById('toggleSignupPass');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passInput.type = 'password';
      toggleBtn.textContent = '👁';
    }
  });

  document.getElementById('toggleSignupPassConfirm').addEventListener('click', function(e) {
    e.preventDefault();
    const passInput = document.getElementById('signupPassConfirm');
    const toggleBtn = document.getElementById('toggleSignupPassConfirm');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passInput.type = 'password';
      toggleBtn.textContent = '👁';
    }
  });

  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;
    const loginErr = document.getElementById('loginErr');
    const loginBtn = document.getElementById('doLogin');
    
    if (!email || !password) {
      loginErr.textContent = 'Please fill in all fields';
      loginErr.style.display = 'block';
      return;
    }
    
    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    loginErr.style.display = 'none';
    
    try {
      // Use the auth.js login function
      const result = await window.vixvvoAuth.login(email, password);
      
      if (result.success) {
        closeAllModals();
        // Page will reload automatically from auth.js
      } else {
        loginErr.textContent = result.error || 'Login failed';
        loginErr.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log in';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginErr.textContent = 'An error occurred. Please try again.';
      loginErr.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
    }
  });

  // Signup form submission (direct signup without email verification)
  document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPass').value;
    const confirmPassword = document.getElementById('signupPassConfirm').value;
    const signupErr = document.getElementById('signupErr');
    const signupBtn = document.getElementById('doSignup');
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      signupErr.textContent = 'Please fill in all fields';
      signupErr.style.display = 'block';
      return;
    }
    
    if (password !== confirmPassword) {
      signupErr.textContent = 'Passwords do not match';
      signupErr.style.display = 'block';
      return;
    }
    
    if (password.length < 6) {
      signupErr.textContent = 'Password must be at least 6 characters';
      signupErr.style.display = 'block';
      return;
    }
    
    // Disable button during signup
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';
    signupErr.style.display = 'none';
    
    try {
      // Create account directly without email verification
      const signupResult = await window.vixvvoAuth.signup(email, password);
      
      if (signupResult.success) {
        closeAllModals();
        // Page will reload from auth.js
      } else {
        signupErr.textContent = signupResult.error || 'Account creation failed';
        signupErr.style.display = 'block';
      }
    } catch (error) {
      console.error('Signup error:', error);
      signupErr.textContent = 'An error occurred. Please try again.';
      signupErr.style.display = 'block';
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Continue';
    }
  });

  // Verification code handling
  if (verificationModal) {
    const codeInputs = ['code1', 'code2', 'code3', 'code4', 'code5', 'code6'];
    
    codeInputs.forEach((id, index) => {
      const input = document.getElementById(id);
      
      input.addEventListener('input', function(e) {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Auto-focus next input
        if (this.value.length === 1 && index < codeInputs.length - 1) {
          document.getElementById(codeInputs[index + 1]).focus();
        }
      });
      
      input.addEventListener('keydown', function(e) {
        // Handle backspace
        if (e.key === 'Backspace' && !this.value && index > 0) {
          document.getElementById(codeInputs[index - 1]).focus();
        }
      });
    });
    
    // Verify button
    document.getElementById('doVerify').addEventListener('click', async function() {
      const code = codeInputs.map(id => document.getElementById(id).value).join('');
      const verifyErr = document.getElementById('verifyErr');
      const verifyBtn = this;
      
      if (code.length !== 6) {
        verifyErr.textContent = 'Please enter the complete 6-digit code';
        verifyErr.style.display = 'block';
        return;
      }
      
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';
      verifyErr.style.display = 'none';
      
      try {
        const email = window.pendingSignup.email;
        
        // Verify the code
        const verifyResult = await window.vixvvoAuth.verifyEmailCode(email, code);
        
        if (verifyResult.success) {
          // Now create the account
          verifyBtn.textContent = 'Creating account...';
          
          const signupResult = await window.vixvvoAuth.signup(email, window.pendingSignup.password);
          
          if (signupResult.success) {
            closeAllModals();
            // Clear pending signup
            delete window.pendingSignup;
            // Page will reload from auth.js
          } else {
            verifyErr.textContent = signupResult.error || 'Account creation failed';
            verifyErr.style.display = 'block';
          }
        } else {
          verifyErr.textContent = verifyResult.error || 'Invalid verification code';
          verifyErr.style.display = 'block';
        }
      } catch (error) {
        console.error('Verification error:', error);
        verifyErr.textContent = 'An error occurred. Please try again.';
        verifyErr.style.display = 'block';
      } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify & Create Account';
      }
    });
    
    // Resend code
    document.getElementById('resendCode').addEventListener('click', async function() {
      const btn = this;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      
      try {
        const result = await window.vixvvoAuth.sendVerificationCode(window.pendingSignup.email);
        
        if (result.success) {
          btn.textContent = 'Code sent!';
          startVerificationTimer();
          setTimeout(() => {
            btn.textContent = 'Resend Code';
            btn.disabled = false;
          }, 3000);
        } else {
          btn.textContent = 'Failed - try again';
          setTimeout(() => {
            btn.textContent = 'Resend Code';
            btn.disabled = false;
          }, 3000);
        }
      } catch (error) {
        btn.textContent = 'Error';
        setTimeout(() => {
          btn.textContent = 'Resend Code';
          btn.disabled = false;
        }, 3000);
      }
    });
    
    // Back to signup
    document.getElementById('backToSignup').addEventListener('click', function(e) {
      e.preventDefault();
      verificationModal.style.display = 'none';
      signupModal.style.display = 'grid';
      // Clear code inputs
      codeInputs.forEach(id => document.getElementById(id).value = '');
    });
  }

  // Verification timer
  let timerInterval;
  function startVerificationTimer() {
    let timeLeft = 600; // 10 minutes in seconds
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      timeLeft--;
      
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      const timerElement = document.getElementById('codeTimer');
      if (timerElement) {
        timerElement.textContent = `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (timerElement) {
          timerElement.textContent = 'Code expired';
          timerElement.style.color = '#ff6b6b';
        }
      }
    }, 1000);
  }

  // Google Sign-In placeholder (implement when ready)
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function() {
      alert('Google Sign-In coming soon!');
    });
  }
  
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
      alert('Google Sign-Up coming soon!');
    });
  }
})();
