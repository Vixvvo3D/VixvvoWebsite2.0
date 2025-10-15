const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./vixvvowebsite-firebase-adminsdk-a36gi-2c02d9f9ef.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vixvvowebsite-default-rtdb.firebaseio.com"
});

// UIDs to delete (all except alexparadis0000@gmail.com)
const uidsToDelete = [
  '6uwZAWmq17bVWCHakW8nHs1TrSh2',  // justinvangaal88@gmail.com
  'hfBNSwWVvYXL9a9y5jbg7HJnCwh1',  // vixvvo@gmail.com
  'kTWVRqip2rSigOaeIBApjXgotIg2',  // justinvg0000@gmail.com
  'm1kgzHn6ttNt2kHutE8xXIkEflK2',  // officialmxkplayz@gmail.com
  'spZlWMmshxOKlAVlMPZfcc9B8Th2',  // mechkeebs469@gmail.com
  'wtWd6zfDkgT6GZNWs9Orxj5URyv2'   // vixvvo3d@gmail.com
];

async function deleteUsers() {
  console.log(`Deleting ${uidsToDelete.length} users...`);
  
  for (const uid of uidsToDelete) {
    try {
      // Get user info first
      const user = await admin.auth().getUser(uid);
      console.log(`Deleting: ${user.email} (${uid})`);
      
      // Delete from Firebase Auth
      await admin.auth().deleteUser(uid);
      
      // Delete from Realtime Database
      await admin.database().ref(`users/${uid}`).remove();
      await admin.database().ref(`usernames/${uid}`).remove();
      
      console.log(`✓ Deleted: ${user.email}`);
    } catch (error) {
      console.error(`✗ Error deleting ${uid}:`, error.message);
    }
  }
  
  console.log('\n✓ Done! Remaining account: alexparadis0000@gmail.com');
  process.exit(0);
}

deleteUsers();
