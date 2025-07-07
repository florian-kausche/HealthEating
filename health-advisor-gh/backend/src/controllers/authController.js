const admin = require('../services/firebaseAdmin');
const User = require('../models/userModel'); // Import Mongoose User model
const mongoose = require('mongoose'); // For checking CastError

// Helper function to check if Firebase Admin SDK is initialized
const isFirebaseAdminInitialized = () => {
  try {
    // Check if the default Firebase app is initialized
    // admin.app() throws if not initialized, so we check admin.apps.length
    return admin.apps.length > 0;
  } catch (e) {
    // This catch block might be redundant if admin itself is not exported correctly when uninitialized
    console.error("Error checking Firebase admin initialization:", e);
    return false;
  }
};

exports.registerUser = async (req, res) => {
  if (!isFirebaseAdminInitialized()) {
    // Pass error to global error handler
    const err = new Error("Firebase Admin SDK not initialized. Cannot register user.");
    err.statusCode = 500;
    return next(err);
  }

  const { email, password, fullName, dateOfBirth, gender, phoneNumber, languagePreference } = req.body;

  // Basic validation
  if (!email || !password || !fullName) {
    const err = new Error("Email, password, and full name are required.");
    err.statusCode = 400;
    return next(err);
  }
  if (password.length < 6) {
    const err = new Error("Password must be at least 6 characters long.");
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Step 1: Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
      // emailVerified: false, // Consider an email verification flow
    });

    // Step 2: Create user profile in MongoDB
    const newUserProfile = new User({
      firebaseUid: userRecord.uid,
      email: userRecord.email, // Store email from Firebase record for consistency
      fullName: userRecord.displayName, // Store name from Firebase record
      dateOfBirth,
      gender,
      phoneNumber,
      languagePreference,
      // Initialize other fields as needed, e.g., notificationPreferences
    });

    await newUserProfile.save();

    // Return the MongoDB user profile (excluding sensitive data if necessary)
    // .toJSON() will include virtuals if schema is configured
    const userProfileForResponse = newUserProfile.toJSON();
    // delete userProfileForResponse.healthHistory; // Example: don't send full history on register

    res.status(201).json({
      message: "User registered successfully in Firebase and profile created in database.",
      user: userProfileForResponse, // Send back the created MongoDB profile
    });

  } catch (error) {
    console.error("Error during user registration:", error);
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-exists') {
      const err = new Error("This email address is already in use by another account.");
      err.statusCode = 400;
      return next(err);
    }
    if (error.code === 'auth/invalid-password') {
      const err = new Error("The password provided is invalid. It must be at least 6 characters long.");
      err.statusCode = 400;
      return next(err);
    }
    // Handle MongoDB validation errors (e.g., from Mongoose schema)
    if (error.name === 'ValidationError') {
      // Collect validation messages
      const messages = Object.values(error.errors).map(val => val.message);
      const err = new Error("Validation failed: " + messages.join(', '));
      err.statusCode = 400;
      err.details = error.errors;
      return next(err);
    }
    // Handle MongoDB duplicate key error (e.g., if email unique constraint fails at DB level despite Firebase check)
    if (error.code === 11000) { // MongoDB duplicate key error code
        const field = Object.keys(error.keyPattern)[0];
        const err = new Error(`An account with that ${field} already exists.`);
        err.statusCode = 409; // 409 Conflict
        return next(err);
    }

    // For other errors, pass to global error handler
    const unhandledError = new Error("An unexpected error occurred during registration.");
    unhandledError.statusCode = 500;
    // unhandledError.originalError = error; // For internal logging if needed
    return next(unhandledError);
  }
};


exports.getCurrentUser = async (req, res, next) => {
  // req.user is populated by verifyFirebaseToken middleware with { uid, email, name, isAdmin }
  if (!req.user || !req.user.uid) {
    const err = new Error("Authentication token did not provide user UID.");
    err.statusCode = 401; // Unauthorized or Bad Request if token is malformed
    return next(err);
  }

  try {
    // Fetch the user's profile from MongoDB using their Firebase UID
    const userProfile = await User.findOne({ firebaseUid: req.user.uid });

    if (!userProfile) {
      // This case might indicate an issue, e.g., user exists in Firebase but not in local DB.
      // Could create a profile on-the-fly, or return an error.
      // For now, return an error. In a robust system, might auto-create a basic profile.
      console.warn(`User profile not found in MongoDB for Firebase UID: ${req.user.uid}. User might need to complete profile setup or there's a sync issue.`);
      const err = new Error("User profile not found. Please complete your profile or contact support.");
      err.statusCode = 404;
      return next(err);
    }

    // Augment Firebase user data with MongoDB profile data
    // The req.user from middleware has Firebase info (uid, email, name, isAdmin)
    // userProfile has MongoDB info. We can combine them or send MongoDB profile.
    // Sending MongoDB profile is usually preferred as it's richer.
    // Ensure isAdmin status from token is preserved if not stored in DB user profile.
    const responseProfile = userProfile.toJSON(); // Includes virtuals like age
    responseProfile.isAdmin = req.user.isAdmin; // Ensure isAdmin from token is authoritative

    res.status(200).json(responseProfile);

  } catch (error) {
    console.error("Error fetching user profile from MongoDB:", error);
    if (error instanceof mongoose.Error.CastError) {
        const err = new Error("Invalid user identifier format.");
        err.statusCode = 400;
        return next(err);
    }
    const unhandledError = new Error("Failed to retrieve user profile.");
    unhandledError.statusCode = 500;
    return next(unhandledError);
  }
};
