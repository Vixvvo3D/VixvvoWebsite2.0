/* Membership Management System */

// Membership tiers
const MEMBERSHIP_TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  SCALING: 'scaling',
  BUSINESS: 'business'
};

// Tier hierarchy (for feature checking)
const TIER_LEVELS = {
  free: 0,
  starter: 1,
  scaling: 2,
  business: 3
};

// Tier display info
const TIER_INFO = {
  free: {
    name: 'Free',
    color: '#6B7280',
    badge: '',
    price: 0
  },
  starter: {
    name: 'Starter',
    color: '#3B82F6',
    badge: '',
    price: 3
  },
  scaling: {
    name: 'Scaling',
    color: '#8B5CF6',
    badge: '',
    price: 10
  },
  business: {
    name: 'Business',
    color: '#F59E0B',
    badge: '',
    price: 25
  }
};

/**
 * Get user's current membership tier
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - Membership tier (bronze, silver, gold, platinum)
 */
async function getUserMembershipTier(userId) {
  if (!userId) return MEMBERSHIP_TIERS.FREE;
  
  try {
    const snapshot = await firebase.database()
      .ref(`users/${userId}/membership/tier`)
      .once('value');
    
    const tier = snapshot.val();
    return tier || MEMBERSHIP_TIERS.FREE;
  } catch (error) {
    console.error('Error getting membership tier:', error);
    return MEMBERSHIP_TIERS.BRONZE;
  }
}

/**
 * Check if user has access to a feature based on required tier
 * @param {string} userTier - User's current tier
 * @param {string} requiredTier - Minimum required tier
 * @returns {boolean}
 */
function hasFeatureAccess(userTier, requiredTier) {
  const userLevel = TIER_LEVELS[userTier] || 0;
  const requiredLevel = TIER_LEVELS[requiredTier] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Update user's membership tier in Firebase
 * @param {string} userId - Firebase user ID
 * @param {string} tier - New membership tier
 * @param {object} patreonData - Patreon subscription data
 */
async function updateUserMembership(userId, tier, patreonData = {}) {
  if (!userId) throw new Error('User ID required');
  
  const membershipData = {
    tier: tier,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
    patreon: {
      patronId: patreonData.patronId || null,
      tierId: patreonData.tierId || null,
      status: patreonData.status || 'active',
      lastSyncedAt: firebase.database.ServerValue.TIMESTAMP
    }
  };
  
  try {
    await firebase.database()
      .ref(`users/${userId}/membership`)
      .set(membershipData);
    
    console.log(`Updated membership for user ${userId} to ${tier}`);
    return true;
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
}

/**
 * Get user's Patreon connection status
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object>}
 */
async function getPatreonConnection(userId) {
  if (!userId) return null;
  
  try {
    const snapshot = await firebase.database()
      .ref(`users/${userId}/membership/patreon`)
      .once('value');
    
    return snapshot.val();
  } catch (error) {
    console.error('Error getting Patreon connection:', error);
    return null;
  }
}

/**
 * Link Patreon account to user
 * @param {string} userId - Firebase user ID
 * @param {string} patreonUserId - Patreon user ID
 * @param {string} accessToken - Patreon OAuth access token
 * @param {string} refreshToken - Patreon OAuth refresh token
 */
async function linkPatreonAccount(userId, patreonUserId, accessToken, refreshToken) {
  if (!userId || !patreonUserId) {
    throw new Error('User ID and Patreon User ID required');
  }
  
  const patreonData = {
    patronId: patreonUserId,
    accessToken: accessToken,
    refreshToken: refreshToken,
    linkedAt: firebase.database.ServerValue.TIMESTAMP,
    status: 'connected'
  };
  
  try {
    await firebase.database()
      .ref(`users/${userId}/patreonConnection`)
      .set(patreonData);
    
    console.log(`Linked Patreon account for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error linking Patreon account:', error);
    throw error;
  }
}

/**
 * Unlink Patreon account from user
 * @param {string} userId - Firebase user ID
 */
async function unlinkPatreonAccount(userId) {
  if (!userId) throw new Error('User ID required');
  
  try {
    // Remove Patreon connection
    await firebase.database()
      .ref(`users/${userId}/patreonConnection`)
      .remove();
    
    // Reset to free tier
    await updateUserMembership(userId, MEMBERSHIP_TIERS.FREE, {
      status: 'disconnected'
    });
    
    console.log(`Unlinked Patreon account for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error unlinking Patreon account:', error);
    throw error;
  }
}

/**
 * Display membership badge in UI
 * @param {string} tier - Membership tier
 * @param {HTMLElement} container - Container element to display badge in
 */
function displayMembershipBadge(tier, container) {
  if (!container) return;
  
  const tierInfo = TIER_INFO[tier] || TIER_INFO.free;
  
  const badge = document.createElement('span');
  badge.className = 'membership-badge';
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: linear-gradient(135deg, ${tierInfo.color}22, ${tierInfo.color}11);
    border: 1px solid ${tierInfo.color}88;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: ${tierInfo.color};
  `;
  badge.textContent = tierInfo.name;
  
  container.innerHTML = '';
  container.appendChild(badge);
}

/**
 * Show feature locked message
 * @param {string} requiredTier - Minimum tier required for feature
 */
function showFeatureLockedMessage(requiredTier) {
  const tierInfo = TIER_INFO[requiredTier];
  
  // Use new notification system if available
  if (typeof showNotification === 'function') {
    showNotification(`This feature requires ${tierInfo.name} membership or higher. Upgrade on Patreon to unlock!`, 'warning', 'Membership Required');
  }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MEMBERSHIP_TIERS,
    TIER_LEVELS,
    TIER_INFO,
    getUserMembershipTier,
    hasFeatureAccess,
    updateUserMembership,
    getPatreonConnection,
    linkPatreonAccount,
    unlinkPatreonAccount,
    displayMembershipBadge,
    showFeatureLockedMessage
  };
}
