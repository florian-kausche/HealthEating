# Health Advisor Ghana

Access to affordable healthcare remains a challenge for many communities in Ghana, particularly in rural or underserved areas. High consultation fees, lack of medical professionals, and limited infrastructure contribute to health disparities. This project aims to build a web-based platform that uses AI to assist patients in identifying potential health issues and recommending affordable next steps—such as over-the-counter treatments or referrals to the nearest low-cost clinic.

The goal is to empower users with preliminary diagnoses and health advice while reducing the pressure on local clinics and hospitals. This platform will especially target low-income households and offer multilingual support to cater to a wider population.

## Features

- AI-powered symptom checker (currently mocked backend)
- Medical chatbot for general health advice (currently mocked backend)
- Clinic locator (uses mock data)
- Health tips and education dashboard (uses mock data)
- Local language support (initial setup for English and Twi using i18next)
- User account system with health history (MongoDB for profile, Firebase for Auth)
- Admin dashboard (basic structure, protected, mock stats)

## Technology Stack

- **Frontend**: React.js (v18) with React Router, Context API
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (connected via Mongoose)
- **Authentication**: Firebase Authentication (Client SDK and Admin SDK)
- **Localization**: i18next, react-i18next
- **Styling**: Global CSS (`App.css`), some inline styles.
- **Testing**:
    - Backend: Jest, Supertest
    - Frontend: Jest, React Testing Library (setup exists, execution issues noted in dev environment)
- **Containerization**: Docker (Dockerfile for backend)
- **Deployment**: Strategy defined (see [DEPLOYMENT.md](DEPLOYMENT.md)) for Firebase Hosting, Google Cloud Run, MongoDB Atlas.
- **Optional SMS Gateway Integration**: Conceptual groundwork laid for SMS features (e.g., OTP, notifications). See `backend/src/services/smsService.js` (mocked) and notes in documentation. Full implementation requires selecting and integrating a third-party SMS provider.

## Project Structure

The project is organized with distinct frontend and backend directories:

-   `health-advisor-gh/`
    -   `backend/`: Contains the Node.js/Express API server.
        -   `src/`: Source code (controllers, middleware, models, routes, services, config).
        -   `tests/`: Backend unit/integration tests.
        -   `Dockerfile`: For containerizing the backend.
        -   `package.json`, `.env.example`.
    -   `frontend/`: Contains the React client application.
        -   `public/`: Static assets, `index.html`.
            -   `locales/`: JSON translation files (e.g., `en/translation.json`, `tw/translation.json`).
            -   `images/mock/`: Placeholder images for UI.
        -   `src/`: React app source code (components, context, pages, services, `App.js`, `i18n.js`, `firebaseConfig.js`).
        -   `package.json`.
    -   `docs/`: Project documentation.
        -   `api_documentation.md`: Details about backend API endpoints.
        -   `admin_setup.md`: Guide for setting up admin users via Firebase Custom Claims.
    -   `AGENTS.MD`: Instructions for AI development agents.
    -   `DEPLOYMENT.MD`: Detailed deployment strategy.
    -   `README.md`: This file.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites

-   Node.js (v18.x or later recommended)
-   npm (v7.x or later recommended, comes with Node.js)
-   MongoDB (a local instance running, or a connection URI to a cloud instance like MongoDB Atlas)
-   Firebase Project: You will need to:
    1.  Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
    2.  Enable Email/Password sign-in method in Firebase Authentication.
    3.  Obtain your web app's Firebase configuration (API key, auth domain, etc.) for the frontend.
    4.  Generate a service account key (JSON file) for the Firebase Admin SDK used by the backend.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd health-advisor-gh/backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    -   Copy `.env.example` to a new file named `.env`.
    -   Open the `.env` file and fill in the required values:
        -   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/health_advisor_gh` for a local DB, or your Atlas URI).
        -   `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`: **Absolute path** to your Firebase Admin SDK service account JSON key file. (Alternatively, you can set `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` with the base64 encoded content of the key file if you prefer not to use a file path, especially for some deployment environments).
        -   `FRONTEND_DEV_URL`: (Defaults to `http://localhost:3000` in `app.js` if not set, used for CORS).
        -   `NODE_ENV`: Set to `development`.
4.  **Run the backend server:**
    ```bash
    npm run dev
    ```
    This uses `nodemon` for automatic restarts during development. The backend server should start (typically on port 3001, or as specified in your `.env` or `app.js`).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    # From project root:
    cd health-advisor-gh/frontend
    # Or if you are in the backend/ directory:
    # cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Firebase Client SDK:**
    -   Open `frontend/src/firebaseConfig.js`.
    -   Replace the placeholder values in the `firebaseConfig` object with your actual Firebase project's **web app configuration keys** (apiKey, authDomain, projectId, etc.). You can find these in your Firebase project settings.
4.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    The React development server will start (usually on `http://localhost:3000`) and should open automatically in your default web browser.

### Running Tests

-   **Backend Tests:**
    ```bash
    cd health-advisor-gh/backend
    npm test
    ```
-   **Frontend Tests:**
    ```bash
    cd health-advisor-gh/frontend
    npm test
    ```
    *(Note: Frontend test execution encountered environment-specific issues in the AI agent's development sandbox related to finding `react-scripts`. This may not occur in a standard local development setup.)*

## Further Documentation
-   **API Endpoints**: See [docs/api_documentation.md](docs/api_documentation.md)
-   **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
-   **Admin User Setup**: See [docs/admin_setup.md](docs/admin_setup.md)
-   **Agent Guidelines**: See [AGENTS.md](AGENTS.md)

---
*(This README provides a general overview. Specific features and their current status (e.g., mocked data) are detailed within the codebase and related documentation.)*
