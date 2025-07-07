module.exports = {
  testEnvironment: 'node', // Environment for testing Node.js applications
  coveragePathIgnorePatterns: [ // Folders/files to ignore in coverage reports
    "/node_modules/",
    "/src/config/", // DB connections are typically integration-tested
    "/src/services/firebaseAdmin.js", // External service initialization
    "/src/app.js" // Main app setup, better for integration/E2E tests
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // A list of paths to directories that Jest should use to search for files in.
  // Adjusted to look for tests within a top-level 'tests' directory.
  roots: [
    "<rootDir>/tests"
  ],
  // Test file pattern - looks for .test.js or .spec.js in the roots.
  testMatch: [
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  // If you need setup files (e.g., for global mocks or environment setup before tests run)
  // setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  verbose: true, // Output more information during tests
};
