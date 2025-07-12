const admin = require('firebase-admin');
const path = require('path');

// Load Firebase config from firebase-config.json
const serviceAccountPath = path.join(__dirname, '../firebase/firebase-config.json');

// Safe check (optional, but nice for dev environments)
if (!path.isAbsolute(serviceAccountPath) || !require.resolve(serviceAccountPath)) {
  throw new Error('Firebase config file not found at: ' + serviceAccountPath);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
}

// Core push notification sender
const sendPushNotification = async (token, title, body) => {
  try {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid or missing FCM token');
    }

    const message = {
      token: token.trim(),
      notification: { title, body },
      android: {
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully. Message ID:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);

    // Retry or logging strategy (optional)
    if (error.code === 'messaging/invalid-registration-token') {
      console.warn('⚠️ Invalid FCM token. Might need update:', token);
    }

    return null;
  }
};

module.exports = { sendPushNotification };
