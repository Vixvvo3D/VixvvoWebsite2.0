const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-your-service-account-key.json'); // You'll need to download this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://vixvvowebsite-default-rtdb.firebaseio.com'
});

const db = admin.database();

/**
 * Clean up expired verification codes
 */
async function cleanExpiredVerificationCodes() {
  console.log('🧹 Cleaning expired verification codes...');
  
  const codesRef = db.ref('verificationCodes');
  const snapshot = await codesRef.once('value');
  const codes = snapshot.val() || {};
  
  let deletedCount = 0;
  const now = Date.now();
  
  for (const [email, data] of Object.entries(codes)) {
    if (data.expiresAt && data.expiresAt < now) {
      await codesRef.child(email).remove();
      deletedCount++;
      console.log(`  ✅ Deleted expired code for: ${email.replace(/,/g, '.')}`);
    }
  }
  
  console.log(`✅ Cleaned ${deletedCount} expired verification codes\n`);
}

/**
 * Remove test/invalid users
 */
async function cleanTestUsers() {
  console.log('🧹 Checking for test users...');
  
  const usersRef = db.ref('users');
  const snapshot = await usersRef.once('value');
  const users = snapshot.val() || {};
  
  let deletedCount = 0;
  
  for (const [uid, userData] of Object.entries(users)) {
    // Check for test accounts (you can customize this logic)
    if (
      !userData.email ||
      !userData.username ||
      userData.email.includes('test') ||
      userData.email.includes('temp')
    ) {
      console.log(`  ⚠️  Found potential test user: ${userData.email || 'no email'}`);
      console.log(`     UID: ${uid}`);
      console.log(`     Would you like to delete this? (manual review recommended)`);
      // Uncomment to actually delete:
      // await usersRef.child(uid).remove();
      // await db.ref('usernames').child(uid).remove();
      // deletedCount++;
    }
  }
  
  console.log(`✅ Found ${deletedCount} test users (review manually)\n`);
}

/**
 * Organize user data structure
 */
async function organizeUserData() {
  console.log('📁 Organizing user data...');
  
  const usersRef = db.ref('users');
  const snapshot = await usersRef.once('value');
  const users = snapshot.val() || {};
  
  let updatedCount = 0;
  
  for (const [uid, userData] of Object.entries(users)) {
    const updates = {};
    let needsUpdate = false;
    
    // Ensure standard fields exist
    if (!userData.role) {
      updates.role = 'user';
      needsUpdate = true;
    }
    
    if (!userData.currency) {
      updates.currency = 'USD';
      needsUpdate = true;
    }
    
    if (!userData.createdAt) {
      updates.createdAt = new Date().toISOString();
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await usersRef.child(uid).update(updates);
      updatedCount++;
      console.log(`  ✅ Updated user: ${userData.email}`);
    }
  }
  
  console.log(`✅ Organized ${updatedCount} user records\n`);
}

/**
 * Clean duplicate printers/filaments
 */
async function cleanDuplicates() {
  console.log('🧹 Checking for duplicate printers/filaments...');
  
  // Check printers
  const printersRef = db.ref('printers');
  const printersSnapshot = await printersRef.once('value');
  const printers = printersSnapshot.val() || {};
  
  const printerNames = new Set();
  let printerDuplicates = 0;
  
  for (const [id, printer] of Object.entries(printers)) {
    if (printerNames.has(printer.name)) {
      console.log(`  ⚠️  Duplicate printer found: ${printer.name} (ID: ${id})`);
      printerDuplicates++;
    } else {
      printerNames.add(printer.name);
    }
  }
  
  // Check filaments
  const filamentsRef = db.ref('filaments');
  const filamentsSnapshot = await filamentsRef.once('value');
  const filaments = filamentsSnapshot.val() || {};
  
  const filamentNames = new Set();
  let filamentDuplicates = 0;
  
  for (const [id, filament] of Object.entries(filaments)) {
    const key = `${filament.brand}-${filament.name}`;
    if (filamentNames.has(key)) {
      console.log(`  ⚠️  Duplicate filament found: ${filament.brand} ${filament.name} (ID: ${id})`);
      filamentDuplicates++;
    } else {
      filamentNames.add(key);
    }
  }
  
  console.log(`✅ Found ${printerDuplicates} duplicate printers, ${filamentDuplicates} duplicate filaments\n`);
}

/**
 * Generate database statistics
 */
async function generateStats() {
  console.log('📊 Generating database statistics...\n');
  
  const stats = {
    users: 0,
    admins: 0,
    printers: 0,
    filaments: 0,
    userPrinters: 0,
    userFilaments: 0,
    verificationCodes: 0
  };
  
  // Count users
  const usersSnapshot = await db.ref('users').once('value');
  const users = usersSnapshot.val() || {};
  stats.users = Object.keys(users).length;
  stats.admins = Object.values(users).filter(u => u.role === 'admin').length;
  
  // Count printers
  const printersSnapshot = await db.ref('printers').once('value');
  stats.printers = printersSnapshot.numChildren();
  
  // Count filaments
  const filamentsSnapshot = await db.ref('filaments').once('value');
  stats.filaments = filamentsSnapshot.numChildren();
  
  // Count user printers
  const userPrintersSnapshot = await db.ref('userPrinters').once('value');
  const userPrinters = userPrintersSnapshot.val() || {};
  stats.userPrinters = Object.values(userPrinters).reduce((sum, up) => sum + Object.keys(up).length, 0);
  
  // Count user filaments
  const userFilamentsSnapshot = await db.ref('userFilaments').once('value');
  const userFilaments = userFilamentsSnapshot.val() || {};
  stats.userFilaments = Object.values(userFilaments).reduce((sum, uf) => sum + Object.keys(uf).length, 0);
  
  // Count verification codes
  const codesSnapshot = await db.ref('verificationCodes').once('value');
  stats.verificationCodes = codesSnapshot.numChildren();
  
  console.log('📊 Database Statistics:');
  console.log('========================');
  console.log(`   Users: ${stats.users} (${stats.admins} admins)`);
  console.log(`   Printers (Global): ${stats.printers}`);
  console.log(`   Filaments (Global): ${stats.filaments}`);
  console.log(`   User Printers: ${stats.userPrinters}`);
  console.log(`   User Filaments: ${stats.userFilaments}`);
  console.log(`   Verification Codes: ${stats.verificationCodes}`);
  console.log('========================\n');
}

/**
 * Main cleanup function
 */
async function runCleanup() {
  console.log('🚀 Starting Firebase Database Cleanup...\n');
  
  try {
    await generateStats();
    await cleanExpiredVerificationCodes();
    await organizeUserData();
    await cleanDuplicates();
    await cleanTestUsers();
    
    console.log('✅ Cleanup complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review the output above');
    console.log('   2. Manually delete test users if needed');
    console.log('   3. Remove duplicate entries');
    console.log('   4. Run stats again to verify\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
  
  process.exit(0);
}

// Run the cleanup
runCleanup();
