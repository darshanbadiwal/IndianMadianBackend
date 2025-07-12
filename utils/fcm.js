const admin = require('firebase-admin');
const path = require('path');

// 1. Load Firebase config - Keep this unchanged
const serviceAccountPath = path.join(__dirname, '../firebase/firebase-config.json');
try {
  require.resolve(serviceAccountPath);
  const serviceAccount = require(serviceAccountPath);
  
  // 2. Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized');
  }
} catch (error) {
  console.error('❌ Firebase Setup Failed:', error.message);
  throw error;
}

// 3. Improved Notification Sender
const sendPushNotification = async (payload) => {
  try {
    // Validate payload structure
    if (!payload || !payload.token || typeof payload.token !== 'string') {
      throw new Error(`Invalid payload format. Expected {token:string, ...}, got ${typeof payload}`);
    }

    // Prepare Android-specific settings
    const message = {
      token: payload.token.trim(), // Ensure string and trim
      notification: payload.notification || {
        title: payload.title || 'New Booking',
        body: payload.body || 'You have a new booking'
      },
      android: {
        priority: 'high',
        notification: {
          channel_id: 'booking_alerts',
          sound: 'default',
          vibrate_timings: payload.vibrate || [100, 200, 300],
          visibility: 'public'
        }
      },
      data: {
        ...(payload.data || {}),
        click_action: payload.click_action || 'OPEN_BOOKING_DETAILS'
      }
    };

    // Send and log
    const response = await admin.messaging().send(message);
    console.log(`📲 Sent to ${payload.token.substring(0, 10)}...`);
    return response;

  } catch (error) {
    console.error('❌ FCM Failed:', {
      code: error.code,
      message: error.message,
      token: payload?.token?.substring(0, 5)
    });
    throw error; // Re-throw for controller handling
  }
};

module.exports = { sendPushNotification };