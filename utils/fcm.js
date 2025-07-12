const admin = require('firebase-admin');
const path = require('path');

// 1. Load Firebase config
const serviceAccountPath = path.join(__dirname, '../firebase/firebase-config.json');
try {
  require.resolve(serviceAccountPath);
} catch (e) {
  throw new Error('Firebase config file missing at: ' + serviceAccountPath);
}

const serviceAccount = require(serviceAccountPath);

// 2. Initialize Firebase Admin (Android-only)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('🔥 Firebase Admin Ready (Android)');
}

const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    // 3. Validate Inputs
    if (!token?.trim()) throw new Error('Invalid FCM token');
    
    // 4. Android-Only Payload
    const message = {
      token: token.trim(),
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'booking_alerts', // Must match AndroidManifest
          vibrate_timings: [100, 200, 300], // Vibrate pattern
          visibility: 'public'
        }
      },
      data: {
        ...data,
        click_action: 'OPEN_BOOKING_DETAILS' // For intent handling
      }
    };

    // 5. Send Notification
    const response = await admin.messaging().send(message);
    console.log('📲 Notification sent to:', token.substring(0, 10) + '...');
    return response;
    
  } catch (error) {
    console.error('❌ FCM Error:', error.code || error.message);
    
    // Handle token errors
    if (error.code === 'messaging/invalid-registration-token') {
      console.warn('⚠️ Token expired or invalid');
    }
    throw error;
  }
};

module.exports = { sendPushNotification };