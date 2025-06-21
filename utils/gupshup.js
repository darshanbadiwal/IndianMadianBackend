const axios = require('axios');
require('dotenv').config();

exports.sendWhatsAppMessage = async (to, name, bookedBy, time, date) => {
  try {
    const message = `🟢 [Test Only] Hello ${name}, your turf has been booked by ${bookedBy} for ${time} on ${date}.`;

    console.log('📦 Preparing to send WhatsApp message:', message);
    console.log('📱 To number:', to);

    // 🔁 Simulate sending by logging (no actual API call yet)
    // Replace this section with API call once app is live

    // const response = await axios.post('https://api.gupshup.io/sm/api/v1/msg', null, {
    //   params: {
    //     channel: 'whatsapp',
    //     source: 'your-gupshup-whatsapp-number',
    //     destination: to,
    //     'src.name': process.env.GUPSHUP_APP_NAME,
    //     message: message,
    //     template: 'turf_booking_alert',
    //     'template.params': `${name}|${bookedBy}|${time}|${date}`,
    //     'template.type': 'text',
    //   },
    //   headers: {
    //     apikey: process.env.GUPSHUP_API_KEY,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   }
    // });

    // console.log('✅ WhatsApp Message Sent:', response.data);

    return true;
  } catch (err) {
    console.error('❌ Gupshup Send Error:', err.message);
    return false;
  }
};  