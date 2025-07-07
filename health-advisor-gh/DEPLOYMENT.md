# Deployment Strategy for Health Advisor Ghana

This document outlines the strategy and steps for deploying the Health Advisor Ghana application.

## Overview

The application consists of:
1.  **Frontend**: A React application (located in `frontend/`).
2.  **Backend**: A Node.js/Express API server (located in `backend/`).
3.  **Database**: MongoDB.

## Recommended Services

-   **Frontend**: Firebase Hosting
-   **Backend**: Google Cloud Run (using Docker)
-   **Database**: MongoDB Atlas

This combination offers a good balance of ease of use, scalability, and cost-effectiveness, especially given the existing use of Firebase Authentication.

## I. Database Deployment (MongoDB Atlas)

1.  **Create a MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create a Free Tier Cluster (M0)**: This is suitable for development and initial small-scale production. Choose a cloud provider (AWS, GCP, Azure) and region that is geographically close to where your backend will be hosted (or where your users are).
3.  **Configure IP Access List**:
    *   For initial setup and testing from your local machine, add your current IP address.
    *   For allowing your backend service (e.g., Google Cloud Run) to connect:
        *   If your backend service has a static outbound IP, add that.
        *   Often, serverless platforms like Cloud Run use a range of dynamic IPs. In such cases, you might need to allow access from `0.0.0.0/0` (any IP address). **If you do this, ensure you have very strong database user credentials.**
4.  **Create a Database User**: In Atlas, under "Database Access", create a new database user with a strong password. Grant this user read/write access to your specific database (e.g., `health_advisor_gh`).
5.  **Get Connection String**: From your Atlas cluster's "Connect" dialog, choose "Connect your application" and get the MongoDB connection string (URI). It will look like `mongodb+srv://<username>:<password>@yourcluster.mongodb.net/health_advisor_gh?retryWrites=true&w=majority`. Replace `<username>` and `<password>` with the credentials you created.
6.  **Set `MONGODB_URI` Environment Variable**: This connection string will be used as the `MONGODB_URI` environment variable for your backend deployment. Store it securely.

## II. Backend Deployment (Node.js API on Google Cloud Run)

### A. Prerequisites
-   Google Cloud SDK installed and configured (`gcloud` CLI).
-   Docker installed locally (for building/testing images, though Cloud Build can also be used).
-   A Google Cloud Project with Billing enabled.
-   Enable necessary APIs in your GCP project: Cloud Build API, Cloud Run API, Artifact Registry API (or Google Container Registry API).

### B. Containerize the Backend
1.  **`Dockerfile`**: A `Dockerfile` is provided in the `health-advisor-gh/backend/` directory. This file defines how to build the Docker image for your Node.js application.
2.  **Build and Push the Docker Image**:
    You can use Google Cloud Build to build the image and push it to Artifact Registry (recommended) or Google Container Registry.
    Navigate to the `health-advisor-gh/backend/` directory in your terminal:
    ```bash
    # Example using Artifact Registry (replace placeholders)
    # First, create a Docker repository in Artifact Registry if you haven't:
    # gcloud artifacts repositories create your-repo-name --repository-format=docker --location=YOUR_REGION --description="Health Advisor Backend Repo"
    #
    # Then, build and submit:
    gcloud builds submit --tag YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/your-repo-name/health-advisor-backend:v1.0.0

    # Example using Google Container Registry (older, but still functional):
    # gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/health-advisor-backend:v1.0.0
    ```
    Replace `YOUR_PROJECT_ID`, `YOUR_REGION`, and `your-repo-name` with your actual GCP details. `v1.0.0` is an example tag.

### C. Deploy to Cloud Run
1.  **Deploy Command**:
    ```bash
    gcloud run deploy health-advisor-backend-service \
      --image YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/your-repo-name/health-advisor-backend:v1.0.0 \
      --platform managed \
      --region YOUR_CHOSEN_REGION \
      --allow-unauthenticated \ # Important if your API is accessed directly by clients or if auth is handled by Firebase tokens within your app
      --port 3001 \ # Match the port your Node.js app listens on (or use process.env.PORT which Cloud Run sets to 8080 by default)
      --set-env-vars="NODE_ENV=production" \
      --set-env-vars="MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING" \
      --set-env-vars="FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=YOUR_BASE64_ENCODED_FIREBASE_KEY" \
      --set-env-vars="FRONTEND_PROD_URL=YOUR_FIREBASE_HOSTING_URL" \
      --set-env-vars="PORT=8080" \ # Cloud Run typically expects services to listen on port 8080 by default. Ensure your app uses process.env.PORT.
      # Optional SMS Gateway Variables (if implementing SMS features):
      # --set-env-vars="SMS_GATEWAY_PROVIDER=your_chosen_provider" \
      # --set-env-vars="SMS_GATEWAY_API_KEY=your_api_key_or_sid" \
      # --set-env-vars="SMS_GATEWAY_AUTH_TOKEN=your_auth_token_if_any" \
      # --set-env-vars="SMS_GATEWAY_SENDER_ID=your_sender_phone_or_id"
      # Add any other necessary environment variables from your .env file.
    ```
    -   `health-advisor-backend-service`: Name for your Cloud Run service.
    -   `YOUR_CHOSEN_REGION`: e.g., `us-central1`, `europe-west1`.
    -   `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`: Encode your Firebase service account JSON key to Base64.
        Example: `cat path/to/serviceAccountKey.json | base64 -w 0` (on Linux/macOS).
2.  **Note the Service URL**: After deployment, Cloud Run will provide a URL for your backend service (e.g., `https://health-advisor-backend-service-xxxxxx-uc.a.run.app`). This URL will be needed for the frontend if not using a proxy.

## III. Frontend Deployment (React App on Firebase Hosting)

### A. Prerequisites
-   Firebase CLI installed (`npm install -g firebase-tools` or `yarn global add firebase-tools`).
-   Logged into Firebase CLI (`firebase login`).
-   A Firebase project created and the frontend configured with your Firebase project's SDK keys in `frontend/src/firebaseConfig.js`.

### B. Configure Firebase for Hosting
1.  **Initialize Firebase Hosting**:
    Navigate to the `health-advisor-gh/frontend/` directory:
    ```bash
    firebase init hosting
    ```
    -   Follow the prompts:
        -   Select your existing Firebase project.
        -   Specify `build` as your public directory (this is the default output for `create-react-app`).
        -   Configure as a single-page app (rewrite all URLs to `/index.html`): Yes.
        -   Set up automatic builds and deploys with GitHub: Choose 'No' for now if you plan to set up CI/CD manually or use a different system like GitHub Actions later.
2.  **(Optional) Configure API Proxy (Firebase Hosting to Cloud Run)**:
    If you want your frontend and backend to appear as if they are on the same domain (e.g., `your-app.web.app` and `your-app.web.app/api`), you can proxy API requests. This simplifies CORS.
    Modify `frontend/firebase.json`:
    ```json
    {
      "hosting": {
        "public": "build",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "rewrites": [
          {
            "source": "/api/**", // All requests to /api/...
            "run": {
              "serviceId": "health-advisor-backend-service", // Your Cloud Run service ID
              "region": "YOUR_CHOSEN_REGION" // The region of your Cloud Run service
            }
          },
          {
            "source": "**", // For all other requests, serve index.html (for SPA routing)
            "destination": "/index.html"
          }
        ]
      }
    }
    ```
    **Permissions**: The Firebase Hosting service account (`[PROJECT_ID]@appspot.gserviceaccount.com`) needs the "Cloud Run Invoker" role on your Cloud Run service. This is often set automatically if in the same project, but verify.

### C. Build and Deploy Frontend
1.  **Set Production API URL (if NOT using Firebase proxy)**:
    If you are not using the Firebase Hosting proxy, your frontend needs to know the absolute URL of your backend.
    Create `frontend/.env.production` (if it doesn't exist):
    ```
    REACT_APP_API_BASE_URL=https://your-cloud-run-backend-service-url.a.run.app
    ```
    Ensure your frontend services (e.g., `authService.js`, `symptomService.js`) use this base URL for API calls in production builds. The current setup uses relative paths like `/api/...`, which assumes same-origin or a proxy.

2.  **Build the React App**:
    In the `health-advisor-gh/frontend/` directory:
    ```bash
    npm run build
    ```
3.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```
    The Firebase CLI will output your hosted site URL (e.g., `https://your-project-id.web.app`).

## IV. CI/CD (Continuous Integration/Continuous Deployment) - Future

-   **Recommendation**: Use **GitHub Actions**.
-   Create workflow files in `health-advisor-gh/.github/workflows/` (e.g., `deploy-backend.yml`, `deploy-frontend.yml`).
-   **Secrets**: Store `FIREBASE_TOKEN` (for Firebase deploys), GCP service account key JSON (for `gcloud` authentication to deploy to Cloud Run), `MONGODB_URI`, etc., as encrypted secrets in your GitHub repository settings.
-   **Backend Workflow**: On push to `main` branch (or on creating a release tag):
    -   Checkout code.
    -   Authenticate to Google Cloud.
    -   Build Docker image using Cloud Build and push to Artifact Registry/GCR.
    -   Deploy the new image to Cloud Run, passing secrets as environment variables.
-   **Frontend Workflow**: On push to `main` branch:
    -   Checkout code.
    -   Set up Node.js.
    -   Install dependencies (`npm ci`).
    -   Build React app (`npm run build`), potentially injecting production environment variables if needed.
    -   Deploy to Firebase Hosting using `firebase deploy --token $FIREBASE_TOKEN`.

## V. Key Environment Variables

**Backend (set in Cloud Run service configuration):**
-   `PORT`: (Set by Cloud Run, typically `8080`. Ensure your `app.js` uses `process.env.PORT`).
-   `NODE_ENV`: `production`
-   `MONGODB_URI`: Your MongoDB Atlas connection string.
-   `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`: Base64 string of your Firebase Admin SDK service account key JSON.
-   `FRONTEND_PROD_URL`: The URL of your deployed Firebase Hosting site (for CORS).
-   `FRONTEND_DEV_URL`: (Not strictly needed for production backend, but good for consistency if .env files are used across envs).
-   `SMS_GATEWAY_PROVIDER`, `SMS_GATEWAY_API_KEY`, `SMS_GATEWAY_AUTH_TOKEN`, `SMS_GATEWAY_SENDER_ID` (If SMS integration is implemented and configured).

**Frontend (Firebase Hosting doesn't use .env files directly for runtime. For build time):**
-   Create `frontend/.env.production` for build-time variables if your API is not proxied:
    -   `REACT_APP_API_BASE_URL=https://your-backend-service-url`
-   Firebase SDK client configuration keys (apiKey, authDomain, etc.) are hardcoded in `frontend/src/firebaseConfig.js`. For better security or multiple environments, these could also be managed via environment variables at build time.

This deployment strategy provides a robust, scalable, and relatively easy-to-manage setup for the Health Advisor Ghana application. Remember to secure all credentials and keys.Tool output for `create_file_with_block`:
