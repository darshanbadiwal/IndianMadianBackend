const admin = require('firebase-admin');
const path = require('path');

// 🔐 Load Firebase service account credentials
const serviceAccount = require(path.join(__dirname, '../firebase/firebase-config.json'));

// ✅ Initialize Firebase App (Only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send push notification to a device using FCM token
 * @param {string} token - FCM device token of turf owner
 * @param {string} title - Notification title
 * @param {string} body - Notification body message
 */
const sendPushNotification = async (token, title, body) => {
  try {
    const message = {
      token,
      notification: {
        title,
        body
      },
      android: {
        notification: {
          sound: 'default', // 👈 default notification sound
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    return null;
  }
};

module.exports = { sendPushNotification };
