const admin = require('firebase-admin');
const path = require('path');

// 🔐 Load Firebase service account credentials
const serviceAccountPath = path.join(__dirname, '../firebase/firebase-config.json');
if (!path.isAbsolute(serviceAccountPath) || !require.resolve(serviceAccountPath)) {
  throw new Error('Firebase config file not found at: ' + serviceAccountPath);
}
const serviceAccount = require(serviceAccountPath);

// ✅ Initialize Firebase App (Only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
}

/**
 * Send push notification to a device using FCM token
 * @param {string} token - FCM device token of turf owner
 * @param {string} title - Notification title
 * @param {string} body - Notification body message
 * @returns {Promise<string|null>} - Message ID on success, null on failure
 */
const sendPushNotification = async (token, title, body) => {
  try {
    // Validate token
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid or missing FCM token');
    }

    const message = {
      token: token.trim(),
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          sound: 'default', // 👈 Default notification sound
          priority: 'high', // 👈 Ensure high priority
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default', // 👈 For iOS
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully. Message ID:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    // Retry logic (optional, can be enhanced)
    if (error.code === 'messaging/invalid-registration-token') {
      console.warn('Invalid token, consider updating it:', token);
    }
    return null;
  }
};

module.exports = { sendPushNotification };