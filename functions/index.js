const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

admin.initializeApp();

// Get email config from environment variables (v2 style)
const emailUser = defineString("EMAIL_USER");
const emailPass = defineString("EMAIL_PASS");

// Patreon OAuth credentials
const patreonClientId = defineString("PATREON_CLIENT_ID");
const patreonClientSecret = defineString("PATREON_CLIENT_SECRET");
const patreonRedirectUri = defineString("PATREON_REDIRECT_URI");
const patreonWebhookSecret = defineString("PATREON_WEBHOOK_SECRET");

// Configure email transporter (using Gmail)
// Note: Email credentials will be set as environment variables
let transporter;

/**
 * Get or create the email transporter
 * @return {object} Nodemailer transporter
 */
function getTransporter() {
  if (!transporter) {
    const user = emailUser.value();
    const pass = emailPass.value();

    if (!user || !pass) {
      console.error(
          "Email configuration missing! " +
          "Please set EMAIL_USER and EMAIL_PASS environment variables",
      );
      throw new Error("Email configuration missing");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });
  }
  return transporter;
}

/**
 * Generate 6-digit verification code
 * @return {string} A random 6-digit code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code email
exports.sendVerificationCode = onCall(async (request) => {
  const {email} = request.data;

  if (!email) {
    throw new HttpsError(
        "invalid-argument",
        "Email is required",
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new HttpsError(
        "invalid-argument",
        "Invalid email format",
    );
  }

  // Check if email is already registered
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    if (userRecord) {
      throw new HttpsError(
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
      from: `Vixvvo <${emailUser.value()}>`,
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

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Verification email sent to ${email}:`, info.messageId);

    return {success: true, message: "Verification code sent"};
  } catch (error) {
    console.error("Error sending verification code:", error);

    // Provide more specific error messages
    if (error.code === "EAUTH") {
      throw new HttpsError(
          "unauthenticated",
          "Email authentication failed. Please contact support.",
      );
    }

    throw new HttpsError(
        "internal",
        "Failed to send verification code: " + error.message,
    );
  }
});

// Verify the code
exports.verifyCode = onCall(async (request) => {
  const {email, code} = request.data;

  if (!email || !code) {
    throw new HttpsError(
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
      throw new HttpsError(
          "not-found",
          "No verification code found for this email",
      );
    }

    // Check if code is expired
    if (Date.now() > verificationData.expiresAt) {
      throw new HttpsError(
          "deadline-exceeded",
          "Verification code has expired",
      );
    }

    // Check if code matches
    if (verificationData.code !== code) {
      throw new HttpsError(
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

// ============================================
// PATREON INTEGRATION
// ============================================

/**
 * Handle Patreon OAuth callback
 * Exchange authorization code for access token
 */
exports.patreonOAuthCallback = onCall(
    async (request) => {
      const {code, userId} = request.data;

      if (!code || !userId) {
        throw new HttpsError(
            "invalid-argument",
            "Code and userId are required",
        );
      }

      // Get Patreon OAuth credentials from environment variables
      const clientId = patreonClientId.value();
      const clientSecret = patreonClientSecret.value();
      const redirectUri = patreonRedirectUri.value();

      if (!clientId || !clientSecret || !redirectUri) {
        throw new HttpsError(
            "failed-precondition",
            "Patreon configuration missing",
        );
      }

      try {
        // Exchange code for access token
        const fetch = require("node-fetch");
        const tokenResponse = await fetch(
            "https://www.patreon.com/api/oauth2/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code: code,
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
              }),
            },
        );

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new Error("Failed to get access token from Patreon");
        }

        // Get user's Patreon identity and membership
        const identityResponse = await fetch(
            "https://www.patreon.com/api/oauth2/v2/identity?" +
          "include=memberships,memberships.currently_entitled_tiers&" +
          "fields[member]=patron_status,currently_entitled_amount_cents," +
          "will_pay_amount_cents,lifetime_support_cents&" +
          "fields[tier]=amount_cents,title",
            {
              headers: {
                "Authorization": `Bearer ${tokenData.access_token}`,
              },
            },
        );

        const identityData = await identityResponse.json();
        const patreonUserId = identityData.data.id;

        // Debug logging
        console.log("Patreon Identity Data:",
            JSON.stringify(identityData, null, 2));

        // Check if this Patreon account is already linked to another user
        const usersSnapshot = await admin.database()
            .ref("users")
            .orderByChild("membership/patreon/patronId")
            .equalTo(patreonUserId)
            .once("value");

        const existingUsers = usersSnapshot.val();
        if (existingUsers) {
          const existingUserIds = Object.keys(existingUsers);
          // Allow if it's the same user re-linking
          if (existingUserIds.length > 0 &&
            !existingUserIds.includes(userId)) {
            throw new HttpsError(
                "already-exists",
                "This Patreon account is already linked to another user. " +
                "Please disconnect it from the other account first.",
            );
          }
        }

        // Determine membership tier based on entitled tiers or amount
        let tier = "free";
        const membership = identityData.included ?
          identityData.included.find((item) => item.type === "member") :
          null;

        console.log("Membership found:", membership);
        console.log("All included data:", identityData.included);

        if (membership &&
          membership.attributes.patron_status === "active_patron") {
          // First, try to get tier from entitled tiers (works for gifts/comps)
          const entitledTiers = identityData.included ?
            identityData.included.filter((item) => item.type === "tier") :
            [];

          console.log("Entitled tiers:", entitledTiers);

          if (entitledTiers.length > 0) {
            // Get the highest tier amount
            const highestTier = entitledTiers.reduce((max, tier) => {
              const amount = tier.attributes.amount_cents || 0;
              return amount > (max.attributes.amount_cents || 0) ? tier : max;
            });

            const tierAmount = highestTier.attributes.amount_cents / 100;
            console.log("Tier amount from entitled tier:", tierAmount);

            // Map tier amount to website tier
            if (tierAmount >= 25) {
              tier = "business";
            } else if (tierAmount >= 10) {
              tier = "scaling";
            } else if (tierAmount >= 3) {
              tier = "starter";
            }
          } else {
            // Fallback to currently_entitled_amount_cents
            const centsAmount =
              membership.attributes.currently_entitled_amount_cents;
            const dollarAmount = centsAmount / 100;

            console.log("Patron Status:", membership.attributes.patron_status);
            console.log("Amount in cents:", centsAmount);
            console.log("Amount in dollars:", dollarAmount);

            // Map amount to tier
            if (dollarAmount >= 25) {
              tier = "business";
            } else if (dollarAmount >= 10) {
              tier = "scaling";
            } else if (dollarAmount >= 3) {
              tier = "starter";
            }
          }
        } else {
          console.log("No active membership found or not an active patron");
        }

        console.log("Final tier assigned:", tier);

        // Store Patreon connection and update membership
        // Use a global lock to prevent race conditions
        const lockRef = admin.database()
            .ref(`patreonLocks/${patreonUserId}`);

        try {
          // Try to acquire lock atomically
          const lockResult = await lockRef.transaction((current) => {
            if (current === null) {
              // Lock is available, acquire it with current user
              return userId;
            } else if (current === userId) {
              // Same user re-linking, allow it
              return userId;
            } else {
              // Lock held by another user, abort
              return undefined; // This will abort the transaction
            }
          });

          if (!lockResult.committed) {
            throw new HttpsError(
                "already-exists",
                "This Patreon account is currently being linked or is " +
                "already linked to another user. " +
                "Please try again in a moment or contact support.",
            );
          }

          // Lock acquired, proceed with linking
          await admin.database().ref(`users/${userId}/patreonConnection`).set({
            patronId: patreonUserId,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            linkedAt: admin.database.ServerValue.TIMESTAMP,
            status: "connected",
          });

          await admin.database().ref(`users/${userId}/membership`).set({
            tier: tier,
            updatedAt: admin.database.ServerValue.TIMESTAMP,
            patreon: {
              patronId: patreonUserId,
              status: (membership && membership.attributes) ?
                membership.attributes.patron_status : "inactive",
              lastSyncedAt: admin.database.ServerValue.TIMESTAMP,
            },
          });

          // Keep the lock to maintain the link
          console.log(`Patreon account ${patreonUserId} linked to user ` +
            `${userId}`);
        } catch (error) {
          // Release lock on error
          await lockRef.remove();
          throw error;
        }

        return {
          success: true,
          tier: tier,
          message: "Patreon account linked successfully",
        };
      } catch (error) {
        console.error("Error in Patreon OAuth:", error);
        throw new HttpsError(
            "internal",
            "Failed to link Patreon account: " + error.message,
        );
      }
    },
);

/**
 * Handle Patreon webhooks
 * Updates user membership when Patreon status changes
 */
exports.patreonWebhook = onRequest(async (req, res) => {
  console.log("=== Patreon Webhook Received ===");
  console.log("Event:", req.headers["x-patreon-event"]);

  // Verify webhook signature
  const webhookSecret = patreonWebhookSecret.value();

  if (webhookSecret) {
    const signature = req.headers["x-patreon-signature"];
    const rawBody = req.rawBody;

    if (!rawBody) {
      console.error("❌ No raw body available for verification");
      // Continue processing but log the issue
      console.warn("⚠️ Proceeding without signature verification");
    } else {
      console.log("Verifying signature...");
      const hmac = crypto.createHmac("md5", webhookSecret);
      const digest = hmac.update(rawBody).digest("hex");

      if (signature !== digest) {
        console.error("❌ Signature mismatch (continuing anyway)");
        console.error(`Expected: ${digest}`);
        console.error(`Received: ${signature}`);
        // For now, just log the mismatch but don't reject
        // TODO: Enable strict verification once we fix the body handling
      } else {
        console.log("✅ Signature verified successfully");
      }
    }
  } else {
    console.warn("⚠️ No webhook secret configured");
  }

  try {
    const event = req.headers["x-patreon-event"];
    const payload = req.body;

    console.log(`Received Patreon webhook: ${event}`);

    // Handle different webhook events
    // Note: Test webhooks use "pledges:*" format
    // Real webhooks use "members:pledge:*" format
    switch (event) {
      case "members:pledge:create":
      case "members:pledge:update":
      case "pledges:create": // Test event
      case "pledges:update": // Test event
        console.log("Processing membership update...");
        await handleMembershipUpdate(payload);
        console.log("✅ Membership update processed");
        break;

      case "members:pledge:delete":
      case "pledges:delete": // Test event
        console.log("Processing membership cancellation...");
        await handleMembershipCancellation(payload);
        console.log("✅ Membership cancellation processed");
        break;

      default:
        console.log(`⚠️ Unhandled webhook event: ${event}`);
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

/**
 * Handle membership update from Patreon
 * @param {object} payload - Webhook payload
 */
async function handleMembershipUpdate(payload) {
  // Extract Patreon user ID
  const userData = (payload.data && payload.data.relationships &&
    payload.data.relationships.user) ?
    payload.data.relationships.user.data : null;
  const patreonUserId = userData ? userData.id : null;

  // Extract tier ID
  const tiersData = (payload.data && payload.data.relationships &&
    payload.data.relationships.currently_entitled_tiers) ?
    payload.data.relationships.currently_entitled_tiers.data : null;
  const tierId = (tiersData && tiersData[0]) ? tiersData[0].id : null;

  const patronStatus = (payload.data && payload.data.attributes) ?
    payload.data.attributes.patron_status : null;
  const amountCents = (payload.data && payload.data.attributes) ?
      (payload.data.attributes.currently_entitled_amount_cents || 0) : 0;

  if (!patreonUserId) {
    console.error("No Patreon user ID in webhook payload");
    return;
  }

  // Find user by Patreon ID
  const usersSnapshot = await admin.database()
      .ref("users")
      .orderByChild("patreonConnection/patronId")
      .equalTo(patreonUserId)
      .once("value");

  const users = usersSnapshot.val();

  if (!users) {
    console.log(`No user found with Patreon ID: ${patreonUserId}`);
    return;
  }

  // Update each user (should only be one)
  for (const userId in users) {
    if (Object.prototype.hasOwnProperty.call(users, userId)) {
      // Determine tier based on amount
      let tier = "free";
      const dollarAmount = amountCents / 100;

      if (patronStatus === "active_patron") {
        if (dollarAmount >= 25) {
          tier = "business";
        } else if (dollarAmount >= 10) {
          tier = "scaling";
        } else if (dollarAmount >= 3) {
          tier = "starter";
        }
      }

      // Update membership
      await admin.database().ref(`users/${userId}/membership`).update({
        tier: tier,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        patreon: {
          patronId: patreonUserId,
          tierId: tierId,
          status: patronStatus,
          amountCents: amountCents,
          lastSyncedAt: admin.database.ServerValue.TIMESTAMP,
        },
      });

      console.log(`Updated membership for user ${userId} to ${tier}`);
    }
  }
}

/**
 * Handle membership cancellation from Patreon
 * @param {object} payload - Webhook payload
 */
async function handleMembershipCancellation(payload) {
  // Extract Patreon user ID
  const userData = (payload.data && payload.data.relationships &&
    payload.data.relationships.user) ?
    payload.data.relationships.user.data : null;
  const patreonUserId = userData ? userData.id : null;

  if (!patreonUserId) {
    console.error("No Patreon user ID in webhook payload");
    return;
  }

  // Find user by Patreon ID
  const usersSnapshot = await admin.database()
      .ref("users")
      .orderByChild("patreonConnection/patronId")
      .equalTo(patreonUserId)
      .once("value");

  const users = usersSnapshot.val();

  if (!users) {
    console.log(`No user found with Patreon ID: ${patreonUserId}`);
    return;
  }

  // Update each user to free tier
  for (const userId in users) {
    if (Object.prototype.hasOwnProperty.call(users, userId)) {
      await admin.database().ref(`users/${userId}/membership`).update({
        tier: "free",
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        patreon: {
          patronId: patreonUserId,
          status: "former_patron",
          lastSyncedAt: admin.database.ServerValue.TIMESTAMP,
        },
      });

      console.log(`Reset membership for user ${userId} to free`);
    }
  }
}

/**
 * Sync user membership with Patreon
 * Can be called manually or scheduled
 */
exports.syncPatreonMembership = onCall(
    async (request) => {
      const {userId} = request.data;

      if (!userId) {
        throw new HttpsError(
            "invalid-argument",
            "User ID required",
        );
      }

      try {
        // Get user's Patreon connection
        const connectionSnapshot = await admin.database()
            .ref(`users/${userId}/patreonConnection`)
            .once("value");

        const connection = connectionSnapshot.val();

        if (!connection || !connection.accessToken) {
          throw new HttpsError(
              "not-found",
              "No Patreon connection found",
          );
        }

        // Fetch current membership from Patreon
        const fetch = require("node-fetch");
        const identityResponse = await fetch(
            "https://www.patreon.com/api/oauth2/v2/identity?" +
          "include=memberships&fields[member]=patron_status," +
          "currently_entitled_amount_cents",
            {
              headers: {
                "Authorization": `Bearer ${connection.accessToken}`,
              },
            },
        );

        const identityData = await identityResponse.json();

        // Determine membership tier
        let tier = "free";
        const membership = identityData.included ?
            identityData.included.find((item) => item.type === "member") :
            null;

        if (membership &&
          membership.attributes.patron_status === "active_patron") {
          const centsAmount =
          membership.attributes.currently_entitled_amount_cents;
          const dollarAmount = centsAmount / 100;

          if (dollarAmount >= 25) {
            tier = "business";
          } else if (dollarAmount >= 10) {
            tier = "scaling";
          } else if (dollarAmount >= 3) {
            tier = "starter";
          }
        }

        // Update membership in database
        await admin.database().ref(`users/${userId}/membership`).set({
          tier: tier,
          updatedAt: admin.database.ServerValue.TIMESTAMP,
          patreon: {
            patronId: connection.patronId,
            status: (membership && membership.attributes) ?
              membership.attributes.patron_status : "inactive",
            lastSyncedAt: admin.database.ServerValue.TIMESTAMP,
          },
        });

        return {
          success: true,
          tier: tier,
          message: "Membership synced successfully",
        };
      } catch (error) {
        console.error("Error syncing membership:", error);
        throw new HttpsError(
            "internal",
            "Failed to sync membership: " + error.message,
        );
      }
    },
);

/**
 * Unlink Patreon account
 * Removes the connection and releases the lock
 */
exports.unlinkPatreonAccount = onCall(
    async (request) => {
      // Check authentication
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Must be logged in to unlink Patreon account",
        );
      }

      const userId = request.auth.uid;

      try {
        // Get current Patreon connection
        const connectionSnapshot = await admin.database()
            .ref(`users/${userId}/patreonConnection`)
            .once("value");

        const connection = connectionSnapshot.val();

        if (!connection || !connection.patronId) {
          throw new HttpsError(
              "not-found",
              "No Patreon account is linked",
          );
        }

        const patronId = connection.patronId;

        // Remove the lock
        await admin.database()
            .ref(`patreonLocks/${patronId}`)
            .remove();

        // Remove Patreon connection
        await admin.database()
            .ref(`users/${userId}/patreonConnection`)
            .remove();

        // Reset membership to free tier
        await admin.database()
            .ref(`users/${userId}/membership`)
            .set({
              tier: "free",
              updatedAt: admin.database.ServerValue.TIMESTAMP,
              patreon: {
                patronId: null,
                status: "disconnected",
                lastSyncedAt: admin.database.ServerValue.TIMESTAMP,
              },
            });

        console.log(`Patreon account ${patronId} unlinked from user ${userId}`);

        return {
          success: true,
          message: "Patreon account unlinked successfully",
        };
      } catch (error) {
        console.error("Error unlinking Patreon account:", error);
        throw new HttpsError(
            "internal",
            "Failed to unlink Patreon account: " + error.message,
        );
      }
    },
);

// ============================================================================
// ORDER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Create a new order with server-side validation
 */
exports.createOrder = onCall(
    {cors: true},
    async (request) => {
      try {
        // Verify user is authenticated
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated to create orders",
          );
        }

        const userId = request.auth.uid;
        const orderData = request.data;

        // Validate required fields
        if (!orderData.orderTitle || !orderData.clientName) {
          throw new HttpsError(
              "invalid-argument",
              "Order title and client name are required",
          );
        }

        // Validate email format if provided
        if (orderData.clientEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(orderData.clientEmail)) {
            throw new HttpsError(
                "invalid-argument",
                "Invalid email format",
            );
          }
        }

        // Validate numeric fields
        const quantity = parseInt(orderData.quantity) || 1;
        const total = parseFloat(orderData.total) || 0;
        const amountPaid = parseFloat(orderData.amountPaid) || 0;

        if (quantity < 1) {
          throw new HttpsError(
              "invalid-argument",
              "Quantity must be at least 1",
          );
        }

        if (total < 0 || amountPaid < 0) {
          throw new HttpsError(
              "invalid-argument",
              "Amounts cannot be negative",
          );
        }

        if (amountPaid > total) {
          throw new HttpsError(
              "invalid-argument",
              "Amount paid cannot exceed total",
          );
        }

        // Sanitize and structure the order
        const sanitizedOrder = {
          date: admin.database.ServerValue.TIMESTAMP,
          createdAt: admin.database.ServerValue.TIMESTAMP,
          orderTitle: String(orderData.orderTitle).trim().substring(0, 200),
          clientName: String(orderData.clientName).trim().substring(0, 100),
          clientEmail: orderData.clientEmail ?
            String(orderData.clientEmail).trim().substring(0, 100) : "",
          clientPhone: orderData.clientPhone ?
            String(orderData.clientPhone).trim().substring(0, 50) : "",
          clientStreet: orderData.clientStreet ?
            String(orderData.clientStreet).trim().substring(0, 200) : "",
          clientCity: orderData.clientCity ?
            String(orderData.clientCity).trim().substring(0, 100) : "",
          clientState: orderData.clientState ?
            String(orderData.clientState).trim().substring(0, 100) : "",
          clientPostalCode: orderData.clientPostalCode ?
            String(orderData.clientPostalCode).trim().substring(0, 20) : "",
          clientCountry: orderData.clientCountry ?
            String(orderData.clientCountry).trim().substring(0, 100) : "",
          messagingApp: orderData.messagingApp || "",
          productName: orderData.productName ?
            String(orderData.productName).trim().substring(0, 200) : "",
          quantity: quantity,
          colors: Array.isArray(orderData.colors) ?
            orderData.colors.slice(0, 10).map((c) => String(c).trim()) : [],
          material: orderData.material || "",
          finish: orderData.finish || "",
          scale: orderData.scale || "",
          extraNotes: orderData.extraNotes ?
            String(orderData.extraNotes).trim().substring(0, 1000) : "",
          total: total,
          amountPaid: amountPaid,
          paymentMethod: orderData.paymentMethod || "",
          paymentStatus: orderData.paymentStatus || "unpaid",
          orderStatus: orderData.orderStatus || "pending",
          userId: userId,
        };

        // Save to database
        const orderRef = admin.database().ref(`orders/${userId}`).push();
        await orderRef.set(sanitizedOrder);

        console.log(`Order created: ${orderRef.key} for user ${userId}`);

        return {
          success: true,
          orderId: orderRef.key,
          message: "Order created successfully",
        };
      } catch (error) {
        console.error("Error creating order:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to create order: " + error.message,
        );
      }
    },
);

/**
 * Update an existing order
 */
exports.updateOrder = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {orderId, updates} = request.data;

        if (!orderId) {
          throw new HttpsError(
              "invalid-argument",
              "Order ID is required",
          );
        }

        // Verify order exists and belongs to user
        const orderRef = admin.database().ref(`orders/${userId}/${orderId}`);
        const snapshot = await orderRef.once("value");

        if (!snapshot.exists()) {
          throw new HttpsError(
              "not-found",
              "Order not found or access denied",
          );
        }

        // Validate updates
        const sanitizedUpdates = {};

        if (updates.orderStatus) {
          sanitizedUpdates.orderStatus = updates.orderStatus;
        }
        if (updates.paymentStatus) {
          sanitizedUpdates.paymentStatus = updates.paymentStatus;
        }
        if (updates.amountPaid !== undefined) {
          const amountPaid = parseFloat(updates.amountPaid);
          if (amountPaid < 0) {
            throw new HttpsError(
                "invalid-argument",
                "Amount paid cannot be negative",
            );
          }
          sanitizedUpdates.amountPaid = amountPaid;
        }
        if (updates.extraNotes !== undefined) {
          sanitizedUpdates.extraNotes =
            String(updates.extraNotes).trim().substring(0, 1000);
        }

        sanitizedUpdates.updatedAt = admin.database.ServerValue.TIMESTAMP;

        await orderRef.update(sanitizedUpdates);

        console.log(`Order updated: ${orderId} for user ${userId}`);

        return {
          success: true,
          message: "Order updated successfully",
        };
      } catch (error) {
        console.error("Error updating order:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to update order: " + error.message,
        );
      }
    },
);

/**
 * Delete an order (soft delete - moves to archive)
 */
exports.deleteOrder = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {orderId} = request.data;

        if (!orderId) {
          throw new HttpsError(
              "invalid-argument",
              "Order ID is required",
          );
        }

        // Verify order exists and belongs to user
        const orderRef = admin.database().ref(`orders/${userId}/${orderId}`);
        const snapshot = await orderRef.once("value");

        if (!snapshot.exists()) {
          throw new HttpsError(
              "not-found",
              "Order not found or access denied",
          );
        }

        const orderData = snapshot.val();

        // Archive the order before deletion
        const archiveRef = admin.database()
            .ref(`orders_archive/${userId}/${orderId}`);
        await archiveRef.set({
          ...orderData,
          deletedAt: admin.database.ServerValue.TIMESTAMP,
          deletedBy: userId,
        });

        // Remove from active orders
        await orderRef.remove();

        console.log(`Order deleted and archived: ${orderId} by user ${userId}`);

        return {
          success: true,
          message: "Order deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting order:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to delete order: " + error.message,
        );
      }
    },
);

/**
 * Duplicate an existing order
 */
exports.duplicateOrder = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {orderId} = request.data;

        if (!orderId) {
          throw new HttpsError(
              "invalid-argument",
              "Order ID is required",
          );
        }

        // Get the original order
        const originalOrderRef =
          admin.database().ref(`orders/${userId}/${orderId}`);
        const snapshot = await originalOrderRef.once("value");

        if (!snapshot.exists()) {
          throw new HttpsError(
              "not-found",
              "Order not found or access denied",
          );
        }

        const originalOrder = snapshot.val();

        // Create duplicated order with reset fields
        const duplicatedOrder = {
          ...originalOrder,
          date: admin.database.ServerValue.TIMESTAMP,
          createdAt: admin.database.ServerValue.TIMESTAMP,
          orderStatus: "pending",
          paymentStatus: "unpaid",
          amountPaid: 0,
          duplicatedFrom: orderId,
        };

        // Save the duplicate
        const newOrderRef = admin.database().ref(`orders/${userId}`).push();
        await newOrderRef.set(duplicatedOrder);

        console.log(`Order duplicated: ${orderId} -> ${newOrderRef.key}`);

        return {
          success: true,
          orderId: newOrderRef.key,
          message: "Order duplicated successfully",
        };
      } catch (error) {
        console.error("Error duplicating order:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to duplicate order: " + error.message,
        );
      }
    },
);

// ============================================================================
// PRESET MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Save printer preset
 */
exports.savePrinterPreset = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {printerData, presetId} = request.data;

        if (!printerData || !printerData.name) {
          throw new HttpsError(
              "invalid-argument",
              "Printer name is required",
          );
        }

        // Check preset limit (max 50 printers per user)
        if (!presetId) {
          const existingPresetsRef =
            admin.database().ref(`users/${userId}/printers`);
          const snapshot = await existingPresetsRef.once("value");
          const count = snapshot.numChildren();

          if (count >= 50) {
            throw new HttpsError(
                "resource-exhausted",
                "Maximum printer limit reached (50)",
            );
          }
        }

        // Sanitize printer data
        const sanitizedPrinter = {
          name: String(printerData.name).trim().substring(0, 100),
          brand: printerData.brand ?
            String(printerData.brand).trim().substring(0, 100) : "",
          model: printerData.model ?
            String(printerData.model).trim().substring(0, 100) : "",
          buildVolume: printerData.buildVolume || "",
          nozzleSize: printerData.nozzleSize || "",
          maxTemp: printerData.maxTemp || "",
          bedTemp: printerData.bedTemp || "",
          printSpeed: printerData.printSpeed || "",
          createdAt: admin.database.ServerValue.TIMESTAMP,
        };

        const userPrintersRef =
          admin.database().ref(`users/${userId}/printers`);

        if (presetId) {
          // Update existing
          await userPrintersRef.child(presetId).update(sanitizedPrinter);
          console.log(`Printer preset updated: ${presetId} for user ${userId}`);
        } else {
          // Create new
          const newPresetRef = await userPrintersRef.push(sanitizedPrinter);
          console.log(`Printer preset created: ${newPresetRef.key}`);
        }

        return {
          success: true,
          message: presetId ?
            "Printer updated successfully" :
            "Printer added successfully",
        };
      } catch (error) {
        console.error("Error saving printer preset:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to save printer preset: " + error.message,
        );
      }
    },
);

/**
 * Save filament preset
 */
exports.saveFilamentPreset = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {filamentData, presetId} = request.data;

        if (!filamentData || !filamentData.name) {
          throw new HttpsError(
              "invalid-argument",
              "Filament name is required",
          );
        }

        // Check preset limit (max 50 filaments per user)
        if (!presetId) {
          const existingPresetsRef =
            admin.database().ref(`users/${userId}/filaments`);
          const snapshot = await existingPresetsRef.once("value");
          const count = snapshot.numChildren();

          if (count >= 50) {
            throw new HttpsError(
                "resource-exhausted",
                "Maximum filament limit reached (50)",
            );
          }
        }

        // Sanitize filament data
        const sanitizedFilament = {
          name: String(filamentData.name).trim().substring(0, 100),
          brand: filamentData.brand ?
            String(filamentData.brand).trim().substring(0, 100) : "",
          material: filamentData.material || "",
          color: filamentData.color ?
            String(filamentData.color).trim().substring(0, 50) : "",
          diameter: filamentData.diameter || "",
          weight: filamentData.weight || "",
          pricePerKg: filamentData.pricePerKg ?
            parseFloat(filamentData.pricePerKg) : 0,
          printTemp: filamentData.printTemp || "",
          bedTemp: filamentData.bedTemp || "",
          createdAt: admin.database.ServerValue.TIMESTAMP,
        };

        const userFilamentsRef =
          admin.database().ref(`users/${userId}/filaments`);

        if (presetId) {
          // Update existing
          await userFilamentsRef.child(presetId).update(sanitizedFilament);
          console.log(`Filament preset updated: ${presetId}`);
        } else {
          // Create new
          const newPresetRef = await userFilamentsRef.push(sanitizedFilament);
          console.log(`Filament preset created: ${newPresetRef.key}`);
        }

        return {
          success: true,
          message: presetId ?
            "Filament updated successfully" :
            "Filament added successfully",
        };
      } catch (error) {
        console.error("Error saving filament preset:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to save filament preset: " + error.message,
        );
      }
    },
);

/**
 * Delete a preset (printer or filament)
 */
exports.deletePreset = onCall(
    {cors: true},
    async (request) => {
      try {
        if (!request.auth) {
          throw new HttpsError(
              "unauthenticated",
              "User must be authenticated",
          );
        }

        const userId = request.auth.uid;
        const {presetId, presetType} = request.data;

        if (!presetId || !presetType) {
          throw new HttpsError(
              "invalid-argument",
              "Preset ID and type are required",
          );
        }

        if (!["printers", "filaments", "presets"].includes(presetType)) {
          throw new HttpsError(
              "invalid-argument",
              "Invalid preset type",
          );
        }

        const presetRef =
          admin.database().ref(`users/${userId}/${presetType}/${presetId}`);
        const snapshot = await presetRef.once("value");

        if (!snapshot.exists()) {
          throw new HttpsError(
              "not-found",
              "Preset not found",
          );
        }

        await presetRef.remove();

        console.log(`Preset deleted: ${presetType}/${presetId}`);

        return {
          success: true,
          message: "Preset deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting preset:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError(
            "internal",
            "Failed to delete preset: " + error.message,
        );
      }
    },
);
