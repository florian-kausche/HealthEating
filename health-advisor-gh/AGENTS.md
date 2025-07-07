# Agent Instructions for Health Advisor Ghana Project

This document provides guidelines for AI agents working on this project.

## General Principles

1.  **Follow the Plan:** Adhere to the project plan outlined by the user and updated by the lead agent.
2.  **Modular Code:** Write modular and reusable code.
3.  **Clear Commits:** Use clear and descriptive commit messages. For feature implementations, reference the related issue or task.
4.  **Testing:**
    - Write unit tests for backend logic and consider UI tests for critical frontend components.
    - Backend tests are located in `backend/tests/` and use Jest. Focus on testing controller logic (mocking requests/responses) and service functions.
    - Frontend tests (e.g., `frontend/src/components/Auth/Login.test.js`) use Jest and React Testing Library. Focus on component rendering, basic interactions, and state changes.
    - (Agent Note: Frontend test execution via `run_in_bash_session` has been unreliable. Ensure tests run correctly in a local standard development environment.)
5.  **Documentation:** Keep documentation (READMEs, API docs, `DEPLOYMENT.md`, `admin_setup.md`) up-to-date with changes.
6.  **Security:** Prioritize security, especially when handling user data and authentication. Sanitize inputs and use secure practices.
7.  **User Experience:** Keep the target user (low-income households, potentially with limited tech literacy) in mind when designing interfaces and features. Simplicity and clarity are key.
8.  **Localization:**
    - Ensure that all user-facing text is easily translatable.
    - The project uses `i18next` and `react-i18next`. New translatable strings should be added to `frontend/src/locales/{lang}/translation.json`.
    - Use the `useTranslation` hook (`t` function) for text, and the `<Trans>` component for strings containing HTML elements or React components.

## Backend (Node.js/Express.js)

1.  **Error Handling:** Implement robust error handling. The backend has a global error handler. Use `next(err)` in controllers to pass errors to it. Strive for consistent JSON error response formats (`{ message: "...", details: [...] }`).
2.  **API Design:** Follow RESTful principles for API design.
3.  **Environment Variables:**
    - Use environment variables for configuration (database credentials, API keys, Firebase service account details, etc.). Do not commit sensitive information.
    - Ensure `backend/.env.example` is updated with any new environment variables.
    - Key backend environment variables currently include: `PORT`, `NODE_ENV`, `MONGODB_URI`, `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (or `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`), `FRONTEND_DEV_URL`, `FRONTEND_PROD_URL`.
4.  **Async/Await:** Use `async/await` for all asynchronous operations, especially database calls and external API interactions. Ensure proper error handling with try/catch blocks.

## Frontend (React.js)

1.  **Component Structure:** Organize components logically (e.g., `components/` for shared, `pages/` for route views).
2.  **State Management:** React Context API (`AuthContext`) is used for global auth state. For local component state, use `useState`, `useReducer`.
3.  **Styling:**
    - A global stylesheet (`frontend/src/App.css`) provides base styles and common utility classes (e.g., `.btn`, `.card`, `.form-group`, `.page-title`). Utilize these for consistency.
    - For component-specific styling that isn't broadly reusable, inline styles are acceptable for expediency in this project's current phase.
4.  **Accessibility (a11y):** Ensure the application is accessible. Use semantic HTML (e.g., `label` for inputs, proper heading structure), ARIA attributes where necessary, and ensure keyboard navigability.
5.  **Firebase Configuration**: Client-side Firebase configuration is in `frontend/src/firebaseConfig.js`. This file requires manual population with the user's Firebase project web app keys.
6.  **Environment Variables (Frontend)**: For values that change between environments (e.g., API base URL if not using a proxy), use React's environment variable system (prefix with `REACT_APP_`).

## AI/ML Integration

1.  **API Keys:** Securely manage API keys for any third-party AI services. Use environment variables.
2.  **Data Privacy:** Be mindful of data privacy when sending data to AI models. Anonymize if possible.
3.  **Mocking**: Current AI features (Symptom Checker, Chatbot) use mocked backend logic. When integrating real AI, ensure the API contracts are updated and documented.

## Database (MongoDB)

1.  **Schema Design:** Design clear and efficient Mongoose schemas in `backend/src/models/`.
2.  **Validation:** Implement schema validation within Mongoose models (e.g., required fields, enums, custom validators).
3.  **Data Relationships**: User profiles are linked to Firebase Auth via `firebaseUid`.

## Workflow

1.  Before starting a new feature, ensure you understand the requirements.
2.  Create a new branch for each feature or significant change.
3.  Once a step in the plan is complete, use `plan_step_complete()` and await further instructions or approval.
4.  Before submitting, ensure all tests pass (where runnable by the agent or verifiable locally) and the code adheres to these guidelines.
