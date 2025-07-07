const admin = require('../services/firebaseAdmin');

// Helper function to check if Firebase Admin SDK is initialized
const isFirebaseAdminInitialized = () => {
  try {
    return admin.apps.length > 0;
  } catch (e) {
    return false;
  }
};

const verifyFirebaseToken = async (req, res, next) => {
  if (!isFirebaseAdminInitialized()) {
    // If Firebase isn't set up, we can't verify tokens.
    // Depending on the desired behavior, you could deny all access or allow for local development.
    // For now, we'll deny access as token verification is crucial for security.
    console.warn("Firebase Admin SDK not initialized. Cannot verify token.");
    return res.status(401).json({ message: 'Unauthorized: Authentication service not available.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or malformed token.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = { // Attach user info from token to request object
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName, // displayName from Firebase user
      isAdmin: decodedToken.admin === true, // Check for 'admin' custom claim (set this claim via Firebase Admin SDK)
      // You could also attach all claims if needed:
      // claims: decodedToken
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized: Token expired.' });
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format or signature.'});
    }
    return res.status(401).json({ message: 'Unauthorized: Could not verify token.' });
  }
};

module.exports = { verifyFirebaseToken };
