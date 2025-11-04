/* Example: Feature Gating Implementation */

// This file shows examples of how to gate features based on membership tier

// ============================================
// 1. SIMPLE FEATURE CHECK
// ============================================

async function exportToPDF() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert('Please log in first');
    return;
  }

  // Get user's membership tier
  const tier = await getUserMembershipTier(user.uid);
  
  // Check if user has Silver or higher
  if (!hasFeatureAccess(tier, 'silver')) {
    showFeatureLockedMessage('silver');
    return;
  }
  
  // Feature is available, proceed
  console.log('Exporting to PDF...');
  // Your export code here
}

// ============================================
// 2. DISABLE BUTTONS BASED ON TIER
// ============================================

async function initializePage() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  const tierInfo = TIER_INFO[tier];
  
  // Show membership badge in header
  const badgeContainer = document.getElementById('userBadge');
  if (badgeContainer) {
    displayMembershipBadge(tier, badgeContainer);
  }
  
  // Disable features based on tier
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    if (!hasFeatureAccess(tier, 'silver')) {
      exportBtn.disabled = true;
      exportBtn.title = 'Requires Silver membership or higher';
      exportBtn.innerHTML = '🔒 Export (Silver+)';
    }
  }
  
  const apiAccessBtn = document.getElementById('apiAccessBtn');
  if (apiAccessBtn) {
    if (!hasFeatureAccess(tier, 'platinum')) {
      apiAccessBtn.disabled = true;
      apiAccessBtn.title = 'Requires Platinum membership';
      apiAccessBtn.innerHTML = '🔒 API Access (Platinum)';
    }
  }
}

// ============================================
// 3. SHOW/HIDE UI ELEMENTS
// ============================================

async function setupUI() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  
  // Hide premium features for bronze users
  const premiumSections = document.querySelectorAll('.premium-feature');
  premiumSections.forEach(section => {
    if (!hasFeatureAccess(tier, 'silver')) {
      section.style.opacity = '0.5';
      section.style.pointerEvents = 'none';
      
      // Add lock overlay
      const overlay = document.createElement('div');
      overlay.className = 'locked-overlay';
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        ">
          <div style="font-size: 32px; margin-bottom: 10px;">🔒</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Premium Feature</div>
          <div style="font-size: 14px; color: var(--text-muted);">
            Upgrade to Silver or higher
          </div>
          <button 
            onclick="window.location.href='patreon-link.html'" 
            style="
              margin-top: 12px;
              padding: 8px 16px;
              background: var(--purple);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            "
          >
            Upgrade Now
          </button>
        </div>
      `;
      section.style.position = 'relative';
      section.appendChild(overlay);
    }
  });
}

// ============================================
// 4. LIMIT USAGE BASED ON TIER
// ============================================

async function saveCalculation(data) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  
  // Get saved calculations count
  const snapshot = await firebase.database()
    .ref(`users/${user.uid}/calculations`)
    .once('value');
  
  const calculations = snapshot.val() || {};
  const count = Object.keys(calculations).length;
  
  // Set limits based on tier
  const limits = {
    bronze: 10,
    silver: 50,
    gold: 200,
    platinum: Infinity
  };
  
  const limit = limits[tier];
  
  if (count >= limit) {
    alert(`You've reached your limit of ${limit} saved calculations.\n\nUpgrade to ${tier === 'bronze' ? 'Silver' : tier === 'silver' ? 'Gold' : 'Platinum'} for more storage!`);
    return false;
  }
  
  // Save calculation
  await firebase.database()
    .ref(`users/${user.uid}/calculations`)
    .push(data);
  
  return true;
}

// ============================================
// 5. CONDITIONAL FEATURES IN CALCULATOR
// ============================================

async function enhancedCalculation() {
  const user = firebase.auth().currentUser;
  if (!user) {
    return basicCalculation();
  }

  const tier = await getUserMembershipTier(user.uid);
  
  // Basic calculation for everyone
  let result = basicCalculation();
  
  // Add analytics for Silver+
  if (hasFeatureAccess(tier, 'silver')) {
    result.analytics = {
      costBreakdown: calculateDetailedCosts(),
      profitMargin: calculateProfitMargin(),
      recommendations: getOptimizations()
    };
  }
  
  // Add advanced features for Gold+
  if (hasFeatureAccess(tier, 'gold')) {
    result.advanced = {
      multiMaterialSupport: true,
      customBranding: getUserBranding(user.uid),
      exportFormats: ['pdf', 'excel', 'json']
    };
  }
  
  // Add API access for Platinum
  if (hasFeatureAccess(tier, 'platinum')) {
    result.api = {
      enabled: true,
      key: await getAPIKey(user.uid),
      endpoints: [
        '/api/calculate',
        '/api/materials',
        '/api/printers'
      ]
    };
  }
  
  return result;
}

// ============================================
// 6. NAVBAR MEMBERSHIP DISPLAY
// ============================================

async function displayMembershipInNavbar() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  const tierInfo = TIER_INFO[tier];
  
  // Add to user dropdown in navbar
  const userMenu = document.querySelector('.user-dropdown-menu');
  if (userMenu) {
    // Create membership item
    const membershipItem = document.createElement('div');
    membershipItem.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    membershipItem.innerHTML = `
      <span style="font-size: 13px; color: var(--text-muted);">Membership</span>
      <span style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: linear-gradient(135deg, ${tierInfo.color}22, ${tierInfo.color}11);
        border: 1px solid ${tierInfo.color}88;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: ${tierInfo.color};
      ">
        ${tierInfo.name}
      </span>
    `;
    
    // Insert at top of menu
    userMenu.insertBefore(membershipItem, userMenu.firstChild);
    
    // Add manage membership link
    const manageLink = document.createElement('a');
    manageLink.href = 'patreon-link.html';
    manageLink.innerHTML = '⚙️ Manage Membership';
    manageLink.style.cssText = `
      display: block;
      padding: 12px 16px;
      color: var(--text);
      text-decoration: none;
      border-bottom: 1px solid var(--border);
    `;
    userMenu.insertBefore(manageLink, userMenu.children[1]);
  }
}

// ============================================
// 7. SETTINGS PAGE INTEGRATION
// ============================================

async function loadMembershipSettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const tier = await getUserMembershipTier(user.uid);
  const tierInfo = TIER_INFO[tier];
  const patreonConnection = await getPatreonConnection(user.uid);
  
  const container = document.getElementById('membershipSection');
  if (!container) return;
  
  container.innerHTML = `
    <div class="settings-section">
      <h3>💎 Membership</h3>
      
      <div class="membership-card" style="
        background: linear-gradient(135deg, ${tierInfo.color}11, ${tierInfo.color}05);
        border: 2px solid ${tierInfo.color}44;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">
              Current Plan
            </div>
            <div style="font-size: 28px; font-weight: 700; color: ${tierInfo.color};">
              ${tierInfo.name}
            </div>
            ${tier !== 'bronze' ? `
              <div style="font-size: 16px; color: var(--text-muted); margin-top: 4px;">
                $${tierInfo.price}/month via Patreon
              </div>
            ` : ''}
          </div>
          ${patreonConnection && patreonConnection.patronId ? `
            <div style="
              padding: 8px 16px;
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid rgba(16, 185, 129, 0.4);
              border-radius: 8px;
              color: var(--success);
              font-size: 14px;
              font-weight: 600;
            ">
              ✓ Patreon Connected
            </div>
          ` : ''}
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button 
          onclick="window.location.href='patreon-link.html'" 
          class="btn btn-primary"
        >
          ${patreonConnection && patreonConnection.patronId ? 'Manage Membership' : 'Upgrade Membership'}
        </button>
        <button 
          onclick="window.location.href='../index.html#memberships'" 
          class="btn btn-outline"
        >
          View All Tiers
        </button>
      </div>
    </div>
  `;
}

// ============================================
// 8. UPLOAD MODEL PAGE - FILE SIZE LIMITS
// ============================================

async function checkUploadLimits(fileSize) {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert('Please log in to upload models');
    return false;
  }

  const tier = await getUserMembershipTier(user.uid);
  
  // File size limits in MB
  const limits = {
    bronze: 10,
    silver: 50,
    gold: 200,
    platinum: 1000
  };
  
  const limitMB = limits[tier];
  const fileSizeMB = fileSize / (1024 * 1024);
  
  if (fileSizeMB > limitMB) {
    alert(`File too large! Your current tier (${TIER_INFO[tier].name}) allows up to ${limitMB}MB.\n\nUpgrade for larger file uploads.`);
    return false;
  }
  
  return true;
}

// ============================================
// USAGE IN YOUR PAGES
// ============================================

// Add to your page initialization:
auth.onAuthStateChanged(async (user) => {
  if (user) {
    await initializePage();
    await setupUI();
    await displayMembershipInNavbar();
    
    // Page-specific setup
    if (window.location.pathname.includes('settings')) {
      await loadMembershipSettings();
    }
  }
});
