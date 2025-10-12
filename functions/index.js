const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Get email config from Firebase Functions configuration
const emailConfig = functions.config().email || {};
const emailUser = emailConfig.user;
const emailPass = emailConfig.pass;

// Validate email configuration
if (!emailUser || !emailPass) {
  console.error(
      "Email configuration missing! " +
      "Please set email.user and email.pass using:",
  );
  console.error(
      "firebase functions:config:set " +
      "email.user=\"your@email.com\" " +
      "email.pass=\"yourapppassword\"",
  );
}

// Configure email transporter (using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

/**
 * Generate 6-digit verification code
 * @return {string} A random 6-digit code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code email
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  const {email} = data;

  if (!email) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email is required",
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid email format",
    );
  }

  // Check email configuration
  if (!emailUser || !emailPass) {
    console.error("Email configuration missing!");
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Email service is not configured. Please contact support.",
    );
  }

  // Check if email is already registered
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    if (userRecord) {
      throw new functions.https.HttpsError(
          "already-exists",
          "This email is already registered. Please login instead.",
      );
    }
  } catch (error) {
    // If error is "auth/user-not-found", that's good - email is available
    if (error.code !== "auth/user-not-found") {
      // If it's already-exists error we threw, rethrow it
      if (error.code === "already-exists") {
        throw error;
      }
      // For other errors, log and continue
      console.error("Error checking email availability:", error);
    }
  }

  // Generate code
  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

  try {
    // Store code in Realtime Database
    const emailKey = email.replace(/\./g, ",");
    await admin.database().ref(`verificationCodes/${emailKey}`).set({
      code: code,
      expiresAt: expiresAt,
      verified: false,
      createdAt: Date.now(),
    });

    console.log(`Verification code generated for ${email}: ${code}`);

    // Send email
    const mailOptions = {
      from: `Vixvvo <${emailUser}>`,
      to: email,
      subject: "Your Vixvvo Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; 
             max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; 
               text-align: center; font-size: 32px; 
               font-weight: bold; letter-spacing: 5px; 
               margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #666;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}:`, info.messageId);

    return {success: true, message: "Verification code sent"};
  } catch (error) {
    console.error("Error sending verification code:", error);

    // Provide more specific error messages
    if (error.code === "EAUTH") {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Email authentication failed. Please contact support.",
      );
    }

    throw new functions.https.HttpsError(
        "internal",
        "Failed to send verification code: " + error.message,
    );
  }
});

// Verify the code
exports.verifyCode = functions.https.onCall(async (data, context) => {
  const {email, code} = data;

  if (!email || !code) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and code are required",
    );
  }

  try {
    const snapshot = await admin
        .database()
        .ref(`verificationCodes/${email.replace(/\./g, ",")}`)
        .once("value");

    const verificationData = snapshot.val();

    if (!verificationData) {
      throw new functions.https.HttpsError(
          "not-found",
          "No verification code found for this email",
      );
    }

    // Check if code is expired
    if (Date.now() > verificationData.expiresAt) {
      throw new functions.https.HttpsError(
          "deadline-exceeded",
          "Verification code has expired",
      );
    }

    // Check if code matches
    if (verificationData.code !== code) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid verification code",
      );
    }

    // Mark as verified
    await admin
        .database()
        .ref(`verificationCodes/${email.replace(/\./g, ",")}`)
        .update({verified: true});

    return {success: true, message: "Email verified successfully"};
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
});
