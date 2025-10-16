/**
 * Patreon Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.patreon.com/portal/registration/register-clients
 * 2. Create a new OAuth Client
 * 3. Set redirect URI to: https://yourdomain.com/pages/patreon-link.html
 * 4. Copy your Client ID and paste it below
 * 5. Save this file and commit (Client ID is safe to be public)
 */

const PATREON_CONFIG = {
  // Replace this with your actual Patreon Client ID
  // Get it from: https://www.patreon.com/portal/registration/register-clients
  clientId: 'dcc8Oi3zywzx5IBPXpqkqWigT8Qnyx_uUerdA05l8fnUrfes-o0nIQNqtdmttR8q',
  
  // OAuth scopes needed
  scopes: 'identity identity[email] campaigns campaigns.members',
  
  // This will be set automatically based on current domain
  get redirectUri() {
    return `${window.location.origin}/pages/patreon-link.html`;
  },
  
  // Patreon authorization endpoint
  get authUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes
    });
    return `https://www.patreon.com/oauth2/authorize?${params.toString()}`;
  }
};

// Validate configuration
function validatePatreonConfig() {
  if (!PATREON_CONFIG.clientId || PATREON_CONFIG.clientId === 'YOUR_PATREON_CLIENT_ID') {
    console.warn('⚠️ Patreon Client ID not configured! Please update js/patreon-config.js');
    return false;
  }
  return true;
}
