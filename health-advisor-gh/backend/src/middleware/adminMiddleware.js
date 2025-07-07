const adminRequired = (req, res, next) => {
  // This middleware assumes verifyFirebaseToken from authMiddleware has already run
  // and populated req.user, including an `isAdmin` property based on Firebase custom claims.

  if (!req.user) {
    // This should ideally be caught by verifyFirebaseToken if that's always run first.
    // If verifyFirebaseToken is not a prerequisite for some reason, this check is vital.
    return res.status(401).json({ message: "Authentication required to check admin status." });
  }

  if (req.user.isAdmin === true) {
    next(); // User has the 'admin: true' custom claim, proceed to the admin route.
  } else {
    // User is authenticated but does not have the admin claim.
    res.status(403).json({ message: "Forbidden: Administrator access required." });
  }
};

module.exports = { adminRequired };
