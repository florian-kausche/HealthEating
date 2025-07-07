const mongoose = require('mongoose');

// Subdocument schema for individual health records within the user's health history
const healthRecordSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: [true, "Condition name is required for a health record."],
    trim: true
  },
  diagnosedDate: {
    type: Date
  },
  treatment: {
    type: String,
    trim: true
  },
  doctorOrClinic: { // Name of doctor or clinic associated with this record
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  // You might add fields like 'status' (e.g., 'active', 'resolved'), 'severity', etc.
}, {
  _id: true, // Mongoose adds _id by default, but good to be explicit for subdocuments if needed elsewhere
  timestamps: true // Adds createdAt and updatedAt to each health record itself
});

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: [true, "Firebase UID is required."],
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email format validation using a regex
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  fullName: {
    type: String,
    required: [true, "Full name is required."],
    trim: true,
    minlength: [3, "Full name must be at least 3 characters long."]
  },
  dateOfBirth: {
    type: Date,
    // Optional: Add validation to ensure date is in the past
    validate: {
      validator: function(date) {
        return !date || date < new Date(); // Allow null/undefined or date must be in the past
      },
      message: "Date of birth must be in the past."
    }
  },
  gender: {
    type: String,
    enum: {
        values: ['Male', 'Female', 'Other', 'PreferNotToSay', null], // Allow null
        message: 'Gender must be one of: Male, Female, Other, PreferNotToSay, or not specified.'
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    // Example validation for a Ghanaian phone number (can be improved)
    // match: [/^(\+233|0)[2-9]\d{8}$/, "Please fill a valid Ghanaian phone number."]
  },
  phoneNumberVerified: { // For OTP verification status
    type: Boolean,
    default: false,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },
    country: { type: String, default: 'Ghana', trim: true }
  },
  languagePreference: {
    type: String,
    default: 'en',
    enum: ['en', 'twi', 'ewe', 'ga', 'hausa', 'dagbani'], // Example supported languages
    trim: true
  },
  // Health History as an array of embedded documents
  // This is suitable if health records are always accessed via the user
  // and don't need to be queried independently on a large scale.
  healthHistory: [healthRecordSchema],

  profilePictureUrl: {
    type: String,
    trim: true,
    // Consider validation for URL format if needed
  },
  // Example for notification preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    smsGeneral: { type: Boolean, default: false }, // General app notifications via SMS
    smsHealthTips: { type: Boolean, default: false }, // Specific opt-in for health tips
    smsAppointmentReminders: { type: Boolean, default: true }, // Usually important
    app: { type: Boolean, default: true }   // In-app notifications
  },
  // Temporary storage for OTP, if not using a separate cache like Redis
  // Consider TTL indexes in MongoDB for these fields if storing here.
  smsOtp: {
    code: { type: String, trim: true },
    expiresAt: { type: Date }
  },
  // lastLogin: { type: Date } // Could be updated by auth logic

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields to the User document
});

// Instance method to add a health record to a user's history
// Example: user.addHealthRecord({ condition: "Malaria", diagnosedDate: new Date(), notes: "Treated with Coartem" });
userSchema.methods.addHealthRecord = async function(recordData) {
  this.healthHistory.push(recordData); // Mongoose handles creating the subdocument
  try {
    await this.save();
    return this.healthHistory[this.healthHistory.length - 1]; // Return the newly added record
  } catch (error) {
    console.error("Error adding health record:", error);
    throw error; // Re-throw to be handled by caller
  }
};

// Virtual for user's age (if dateOfBirth is present)
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtuals are included when converting to JSON (e.g., for API responses)
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


const User = mongoose.model('User', userSchema);

module.exports = User;
