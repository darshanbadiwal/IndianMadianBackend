const admin = require('firebase-admin');
const path = require('path');

// Load Firebase config
const serviceAccountPath = path.join(__dirname, '../firebase/firebase-config.json');

try {
  require.resolve(serviceAccountPath);
} catch (e) {
  console.error("❌ Firebase config file not found at:", serviceAccountPath);
  throw new Error('Firebase config file not found');
}

const serviceAccount = require(serviceAccountPath);

// Verify service account
if (!serviceAccount.project_id || !serviceAccount.private_key) {
  console.error("❌ Invalid Firebase service account configuration");
  throw new Error('Invalid Firebase service account');
}

// Initialize Admin SDK only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (initError) {
    console.error('❌ Firebase Admin initialization failed:', initError);
    throw initError;
  }
}

const sendPushNotification = async (token, title, body) => {
  try {
    console.log("🔔 Preparing to send notification...");
    console.log("📱 Target token:", token);
    console.log("📢 Title:", title);
    console.log("📝 Body:", body);

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
          visibility: 'public',
          notificationCount: 1,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      data: { // Add some data payload
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        type: 'new_booking',
      },
    };

    console.log("✉️ Message payload:", JSON.stringify(message, null, 2));
    
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully. Message ID:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    
    // Specific error handling
    if (error.code === 'messaging/invalid-registration-token') {
      console.warn('⚠️ Invalid FCM token. Might need update:', token);
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.warn('⚠️ Token no longer registered:', token);
    }
    
    throw error; // Re-throw to handle in calling function
  }
};

module.exports = { sendPushNotification };