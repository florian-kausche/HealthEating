# API Documentation - Health Advisor Ghana

This document outlines the API endpoints for the Health Advisor Ghana platform.

## Base URL

The base URL for all API endpoints is `/api`. Example: `https://yourdomain.com/api/users/register`.
When running locally, this will typically be `http://localhost:3001/api/...` (assuming the backend runs on port 3001).

## Authentication

Most protected API endpoints require a Firebase ID Token to be sent in the `Authorization` header as a Bearer token.

Example: `Authorization: Bearer <FirebaseIdToken>`

The backend verifies this token using the Firebase Admin SDK. If the token is invalid or expired, a `401 Unauthorized` error is returned. Some endpoints may also require specific admin privileges (checked via custom claims on the Firebase token).

Error responses generally follow the format: `{ "message": "Error description", "details": [...] }` (details optional).

---

## User Management (`/api/users`)

### `POST /users/register`
-   **Description:** Registers a new user in Firebase Authentication and creates a corresponding user profile in the application database (MongoDB).
-   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123",
      "fullName": "Test User",
      "dateOfBirth": "1990-01-15", // Optional, YYYY-MM-DD
      "gender": "Female", // Optional
      "phoneNumber": "+233244123456", // Optional
      "languagePreference": "twi" // Optional, defaults to 'en'
    }
    ```
-   **Responses:**
    -   `201 Created`: User successfully registered. Returns the created user profile object from MongoDB.
        ```json
        // Example Successful Response Body
        {
          "message": "User registered successfully in Firebase and profile created in database.",
          "user": {
            "_id": "mongodbObjectId",
            "firebaseUid": "firebaseUIDstring",
            "email": "user@example.com",
            "fullName": "Test User",
            "dateOfBirth": "1990-01-15T00:00:00.000Z",
            "languagePreference": "twi",
            // ... other fields from userModel, including healthHistory (empty array initially)
            "age": 30, // Example virtual field
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
        ```
    -   `400 Bad Request`: Invalid input (e.g., missing required fields, invalid email format, password too short).
    -   `409 Conflict`: Email already in use or other unique constraint violation.
    -   `500 Internal Server Error`: If Firebase Admin SDK or database operation fails unexpectedly.

### `GET /users/me`
-   **Description:** Retrieves the profile of the currently authenticated user from the database.
-   **Authentication:** Required (Firebase ID Token).
-   **Request Body:** None.
-   **Responses:**
    -   `200 OK`: Returns the user profile object from MongoDB, augmented with `isAdmin` status from the token.
        ```json
        // Example Successful Response Body
        {
            "_id": "mongodbObjectId",
            "firebaseUid": "firebaseUIDstring",
            "email": "user@example.com",
            "fullName": "Test User",
            "dateOfBirth": "1990-01-15T00:00:00.000Z",
            "languagePreference": "twi",
            "healthHistory": [ /* ...array of health records... */ ],
            "age": 30, // Example virtual field
            "isAdmin": false, // From Firebase token claim
            "createdAt": "...",
            "updatedAt": "..."
        }
        ```
    -   `401 Unauthorized`: If the token is missing, invalid, or expired.
    -   `404 Not Found`: If the user exists in Firebase but no corresponding profile is found in MongoDB.
    -   `500 Internal Server Error`: If database query fails.

---

## Symptom Checker (`/api/symptoms`)

### `POST /symptoms/check`
-   **Description:** Submits a user's symptom description for analysis (currently uses mock AI logic).
-   **Authentication:** Required (Firebase ID Token).
-   **Request Body:**
    ```json
    {
      "symptomsDescription": "I have a fever and a persistent cough for three days."
    }
    ```
-   **Responses:**
    -   `200 OK`: Returns a mock analysis.
        ```json
        // Example Successful Response Body
        {
          "userInput": "I have a fever and a persistent cough for three days.",
          "potentialIssues": [
            { "name": "Common Cold", "advice": "Rest, drink fluids..." },
            { "name": "Influenza (Flu)", "advice": "Rest, antivirals if early..." }
          ],
          "recommendations": "Over-the-counter meds can help. See a doctor if severe...",
          "requiresUrgentCare": false,
          "disclaimer": "IMPORTANT: This AI-powered symptom checker..."
        }
        ```
    -   `400 Bad Request`: If `symptomsDescription` is missing or empty.
    -   `401 Unauthorized`: Authentication required.

---

## Medical Chatbot (`/api/chatbot`)

### `POST /chatbot/message`
-   **Description:** Sends a message to the medical chatbot (currently uses mock conversational logic).
-   **Authentication:** Required (Firebase ID Token). The user's `firebaseUid` is used implicitly as a session identifier on the backend.
-   **Request Body:**
    ```json
    {
      "message": "Tell me about healthy eating."
    }
    ```
-   **Responses:**
    -   `200 OK`: Returns the chatbot's reply and suggestions.
        ```json
        // Example Successful Response Body
        {
          "response": "A balanced diet is key... Do you have a specific question?",
          "suggestions": ["What are some healthy snacks?", "Tips for meal planning"],
          "sessionId": "firebaseUIDstring" // UID of the authenticated user
        }
        ```
    -   `400 Bad Request`: If `message` is missing or empty.
    -   `401 Unauthorized`: Authentication required.

---

## Clinic Locator (`/api/clinics`)

### `GET /clinics`
-   **Description:** Retrieves a list of clinics. Can be filtered using query parameters.
-   **Authentication:** None (Public).
-   **Query Parameters (Optional):**
    -   `name`: Filter by clinic name (case-insensitive, partial match).
    -   `region`: Filter by region (case-insensitive, partial match).
    -   `service`: Filter by service offered (case-insensitive, partial match).
    -   `cost`: Filter by cost indication (e.g., "low", "medium", "high"; matches start of string, case-insensitive).
    -   Example: `/api/clinics?region=Ashanti&service=Dental`
-   **Responses:**
    -   `200 OK`: Returns an array of clinic objects matching the filters (or all clinics if no filters). An empty array `[]` is returned if no matches.
        ```json
        // Example Successful Response Body (Array of clinic objects)
        [
          {
            "id": "C001",
            "name": "Hope Medical Center",
            "address": "Liberation Rd, Accra, Ghana",
            "region": "Greater Accra",
            // ... other clinic fields as defined in mockClinics
          }
          // ... more clinics
        ]
        ```

### `GET /clinics/:id`
-   **Description:** Retrieves details for a specific clinic by its ID.
-   **Authentication:** None (Public).
-   **URL Parameters:**
    -   `id`: The ID of the clinic (e.g., `C001`).
-   **Responses:**
    -   `200 OK`: Returns the clinic object.
    -   `404 Not Found`: If no clinic with the given ID exists (`{ "message": "Clinic not found." }`).

---

## Health Tips & Education (`/api/health-content`)

### `GET /health-content`
-   **Description:** Retrieves a list of health tips and educational articles. Can be filtered.
-   **Authentication:** None (Public).
-   **Query Parameters (Optional):**
    -   `category`: Filter by category (e.g., "Nutrition", "Exercise"; case-insensitive).
    -   `type`: Filter by content type (e.g., "tip", "article_summary"; case-insensitive).
    -   `search`: Search term (matches title, summary, content, tags; case-insensitive).
    -   Example: `/api/health-content?category=Nutrition&type=tip`
-   **Responses:**
    -   `200 OK`: Returns an array of health content objects. An empty array `[]` if no matches.
        ```json
        // Example Successful Response Body (Array of content objects)
        [
          {
            "id": "N001",
            "type": "tip",
            "category": "Nutrition",
            "title": "Eat a Balanced Diet Daily",
            // ... other content fields as defined in mockHealthContent
          }
          // ... more content
        ]
        ```

### `GET /health-content/:id`
-   **Description:** Retrieves details for a specific health content item by its ID.
-   **Authentication:** None (Public).
-   **URL Parameters:**
    -   `id`: The ID of the content item (e.g., `N001`).
-   **Responses:**
    -   `200 OK`: Returns the content item object.
    -   `404 Not Found`: If no content item with the given ID exists (`{ "message": "Health content item not found." }`).

---

## Admin Dashboard (`/api/admin`)

**Note:** All Admin API endpoints require authentication (Firebase ID Token) AND the user to have an `admin: true` custom claim set in their Firebase token.

### `GET /admin/stats`
-   **Description:** Retrieves mock administrative statistics for the platform.
-   **Authentication:** Required (Firebase ID Token + Admin Claim).
-   **Request Body:** None.
-   **Responses:**
    -   `200 OK`: Returns admin statistics.
        ```json
        // Example Successful Response Body
        {
          "message": "Admin Dashboard Statistics",
          "data": {
            "totalRegisteredUsers": 1523,
            // ... other mock stats as defined in adminController
          },
          "requestingAdmin": {
            "uid": "adminFirebaseUID",
            "email": "admin@example.com"
          }
        }
        ```
    -   `401 Unauthorized`: If token is missing or invalid.
    -   `403 Forbidden`: If user is authenticated but not an admin.

---
*(This documentation will be updated as new features or modifications are implemented.)*
