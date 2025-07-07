# Admin User Setup Guide

The Admin Dashboard and related functionalities in this application are protected and require users to have an "admin" custom claim set on their Firebase Authentication user object. The claim expected is `admin: true`.

## How Custom Claims Work with Firebase

Custom claims allow you to assign specific roles or access levels to your users. These claims are included in the user's ID token, which can then be verified on your backend or read on the client-side (though client-side checks are for UI convenience; authoritative checks must always be on the backend).

## Setting Custom Claims

Custom claims **must** be set using the Firebase Admin SDK in a trusted server environment. This could be:
-   A dedicated Node.js script run by an administrator.
-   A Firebase Cloud Function triggered by an event (e.g., Firestore document write) or callable via HTTPS (with proper security checks).
-   Your existing backend, if it has a secure endpoint for authorized personnel to manage roles.

**You cannot set custom claims directly from the client-side application code due to security risks.**

---

**Example: Node.js script using Firebase Admin SDK**

This is a common way to set a claim for a specific user.

1.  **Ensure Firebase Admin SDK is set up:** Your script will need to initialize the Firebase Admin SDK with your service account credentials, similar to how it's done in `health-advisor-gh/backend/src/services/firebaseAdmin.js`.

2.  **Example script (`setAdmin.js` - place this outside your main app, e.g., in a `scripts` folder):**

    ```javascript
    // scripts/setAdmin.js
    const admin = require('firebase-admin');

    // IMPORTANT: Initialize Firebase Admin SDK
    // Option 1: If your service account key JSON path is set in an env variable
    // const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
    // Option 2: Or directly point to it (ensure this file is NOT committed if hardcoded)
    const serviceAccount = require('./path/to/your/serviceAccountKey.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const userEmailToMakeAdmin = process.argv[2]; // Get email from command line argument

    if (!userEmailToMakeAdmin) {
      console.error("Please provide the user's email address as a command line argument.");
      console.log("Usage: node setAdmin.js user@example.com");
      process.exit(1);
    }

    async function grantAdminRole(email) {
      try {
        const user = await admin.auth().getUserByEmail(email);
        if (user) {
          // Set the custom claim 'admin' to true.
          // This will overwrite any existing custom claims on the user.
          // To add to existing claims, first read them, merge, then set.
          await admin.auth().setCustomUserClaims(user.uid, { admin: true });
          console.log(`Successfully set 'admin: true' claim for ${email} (UID: ${user.uid})`);

          // Optional: Verify the claim was set
          const updatedUser = await admin.auth().getUser(user.uid);
          console.log("Updated user custom claims:", updatedUser.customClaims);
        } else {
          console.error(`User not found for email: ${email}`);
        }
      } catch (error) {
        console.error("Error setting admin claim:", error.message);
      } finally {
        // Optional: Close the admin app if the script is short-lived
        // admin.app().delete();
      }
    }

    grantAdminRole(userEmailToMakeAdmin);
    ```

3.  **How to run the script:**
    *   Save the script (e.g., as `setAdmin.js`).
    *   Replace `'./path/to/your/serviceAccountKey.json'` with the actual path to your Firebase service account key JSON file. **Keep this file secure and do not commit it to your repository.**
    *   Install `firebase-admin` if you haven't in the script's directory: `npm install firebase-admin`
    *   Run from your terminal: `node setAdmin.js admin_user@example.com`

---

## Claim Propagation and Token Refresh

-   **Propagation Time:** After a custom claim is set, it might take a short while (usually seconds, but up to an hour in some edge cases according to Firebase docs) for the claim to be included in new ID tokens.
-   **ID Token Refresh:** For an existing logged-in user on the client-side to see the new claim, their Firebase ID token must be refreshed.
    -   The application (`AuthContext.js` and `adminService.js`) attempts to force a token refresh (`user.getIdToken(true)` or `user.getIdTokenResult()`) when checking admin status or making admin API calls.
    -   Alternatively, the user might need to log out and log back in for the client to receive an ID token with the updated claims.

This setup ensures that the `isAdmin` flag used by both backend middleware and frontend components is based on a securely managed custom claim. Remember to protect your service account key and the script/process used to set these claims.
