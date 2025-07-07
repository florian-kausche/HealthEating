require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// This is a conceptual service. Actual implementation will depend on the chosen SMS gateway provider.
// For now, it simulates sending SMS by logging to the console.

// const axios = require('axios'); // If using a direct HTTP API
// Or import the provider's SDK, e.g.:
// const twilio = require('twilio');
// const africastalking = require('africastalking');

const SMS_PROVIDER = process.env.SMS_GATEWAY_PROVIDER;
const SMS_API_KEY = process.env.SMS_GATEWAY_API_KEY;
const SMS_AUTH_TOKEN = process.env.SMS_GATEWAY_AUTH_TOKEN; // Some providers use this
const SMS_SENDER_ID = process.env.SMS_GATEWAY_SENDER_ID;
// const SMS_API_URL = process.env.SMS_GATEWAY_API_URL; // May not be needed if using SDK

let smsClient;

// Initialize SMS client based on provider (conceptual)
if (SMS_PROVIDER && SMS_API_KEY && SMS_SENDER_ID) {
  console.log(`SMS Service: Provider configured as ${SMS_PROVIDER}.`);
  // Example initialization (these would require actual SDKs and setup)
  // if (SMS_PROVIDER.toLowerCase() === 'twilio' && SMS_AUTH_TOKEN) {
  //   smsClient = twilio(SMS_API_KEY, SMS_AUTH_TOKEN);
  //   console.log("SMS Service: Twilio client conceptually initialized.");
  // } else if (SMS_PROVIDER.toLowerCase() === 'africastalking') {
  //   const credentials = { apiKey: SMS_API_KEY, username: 'sandbox' }; // Username might be different
  //   smsClient = africastalking(credentials).SMS;
  //   console.log("SMS Service: Africa's Talking client conceptually initialized.");
  // } else {
  //   console.warn(`SMS Service: Provider ${SMS_PROVIDER} is recognized but client setup is not fully implemented in this mock.`);
  // }
} else {
  console.warn("SMS Service: Not fully configured. SMS_GATEWAY_PROVIDER, API_KEY, or SENDER_ID missing in .env. SMS will be simulated.");
}

/**
 * Sends an SMS message.
 * @param {string} phoneNumber - The recipient's phone number (should be in international format, e.g., +233xxxxxxxxx).
 * @param {string} message - The text message to send.
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendSMS(phoneNumber, message) {
  if (!phoneNumber || !message) {
    console.error("sendSMS error: Phone number and message are required.");
    return { success: false, error: "Phone number and message are required." };
  }

  // Validate phone number format (basic example, can be enhanced)
  // A library like 'google-libphonenumber' is better for robust validation/formatting.
  if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      console.error(`sendSMS error: Invalid phone number format for ${phoneNumber}`);
      return { success: false, error: `Invalid phone number format: ${phoneNumber}`};
  }


  if (smsClient && SMS_PROVIDER) { // If a real client was initialized
    console.log(`SMS Service: Attempting to send REAL SMS via ${SMS_PROVIDER} (currently mocked/conceptual).`);
    // Example for Twilio (conceptual, actual implementation varies)
    // try {
    //   const response = await smsClient.messages.create({
    //     body: message,
    //     from: SMS_SENDER_ID, // Your Twilio phone number or Alphanumeric Sender ID
    //     to: phoneNumber
    //   });
    //   console.log(`SMS sent via ${SMS_PROVIDER} to ${phoneNumber}. Message SID: ${response.sid}`);
    //   return { success: true, messageId: response.sid };
    // } catch (error) {
    //   console.error(`Error sending SMS via ${SMS_PROVIDER} to ${phoneNumber}:`, error.message);
    //   return { success: false, error: error.message };
    // }

    // For now, even if configured, we'll log as if it's a real attempt but simulate
    console.log(`[PRODUCTION SIMULATION] SMS via ${SMS_PROVIDER} to ${phoneNumber}: "${message}"`);
    console.log(`   (Actual send logic for ${SMS_PROVIDER} would be here)`);
    return { success: true, messageId: `${SMS_PROVIDER}_simulated_${Date.now()}` };

  } else {
    // Simulate sending SMS if not configured or in development without real creds
    console.log(`[SIMULATED SMS] To: ${phoneNumber} | Message: "${message}"`);
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        console.warn("Warning: SMS_SERVICE is simulating SMS in a non-development environment due to missing configuration.");
    }
    return { success: true, messageId: 'simulated_' + Date.now() };
  }
}

module.exports = {
  sendSMS,
  isSmsServiceConfigured: () => !!(smsClient && SMS_PROVIDER) // Helper to check if "real" sending might occur
};
