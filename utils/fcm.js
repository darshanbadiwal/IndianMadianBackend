const serviceAccount = require('../firebase/firebase-config.json');
const admin = require('firebase-admin');

const sendPushNotification = async ({ token, notification, data }) => {
  try {
    const message = {
      token: token.trim(),
      notification,
      data,
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
    console.log("✅ Notification sent:", response);
    return response;
  } catch (err) {
    console.error("❌ Notification failed:", err.message);
    throw err;
  }
};

module.exports = { sendPushNotification };
