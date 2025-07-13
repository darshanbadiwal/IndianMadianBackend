const admin = require('firebase-admin');
const path = require('path');

// ✅ Load Firebase credentials
const serviceAccount = require(path.join(__dirname, '../firebase/firebase-config.json'));

// ✅ Initialize Firebase once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
}

/**
 * Send FCM Push Notification
 */
const sendPushNotification = async ({ token, notification, data }) => {
  try {
    const message = {
      token,
      notification,
      data,
      android: {
        notification: {
          sound: 'default',
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
    console.log('✅ Notification sent:', response);
    return response;
  } catch (error) {
    console.error("❌ Notification failed:", {
      error: error.message,
      token: token?.substring(0, 10)
    });
    return null;
  }
};

module.exports = { sendPushNotification };
