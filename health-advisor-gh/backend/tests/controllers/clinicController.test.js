const { getClinics, getClinicById } = require('../../src/controllers/clinicController');
// We are testing the controller functions directly.
// For testing HTTP endpoints, we'd use supertest with the app instance.

// Mocking req and res objects for controller tests
const mockRequest = (query = {}, params = {}) => ({
  query,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // chainable
  res.json = jest.fn().mockReturnValue(res);   // chainable
  return res;
};

// Jest timer mocks to handle setTimeout
// Apply fake timers for all tests in this file
beforeAll(() => {
  jest.useFakeTimers();
});

describe('Clinic Controller', () => {

  // Clear mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks(); // Clears jest.fn() calls, etc.
  });

  describe('getClinics', () => {
    it('should return a 200 status and an array of clinics when called with no filters', async () => {
      const req = mockRequest();
      const res = mockResponse();

      getClinics(req, res);
      jest.runAllTimers(); // Execute all pending timers (setTimeout in controller)

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));

      const jsonResponse = res.json.mock.calls[0][0];
      // Based on current mockData, we expect more than 0 clinics
      expect(jsonResponse.length).toBeGreaterThan(0);
      if (jsonResponse.length > 0) {
        expect(jsonResponse[0]).toHaveProperty('id');
        expect(jsonResponse[0]).toHaveProperty('name');
        expect(jsonResponse[0]).toHaveProperty('services');
      }
    });

    it('should filter clinics by region query parameter', async () => {
      const req = mockRequest({ region: 'Ashanti' });
      const res = mockResponse();
      getClinics(req, res);
      jest.runAllTimers();

      expect(res.status).toHaveBeenCalledWith(200);
      const clinics = res.json.mock.calls[0][0];
      expect(clinics.length).toBeGreaterThan(0); // Expect at least one Ashanti clinic
      expect(clinics.every(clinic => clinic.region === 'Ashanti')).toBe(true);
      expect(clinics.some(c => c.id === "C002")).toBe(true); // C002 is Kumasi City Clinic in Ashanti
    });

    it('should filter clinics by service query parameter', async () => {
        const req = mockRequest({ service: 'Dental Care' });
        const res = mockResponse();
        getClinics(req, res);
        jest.runAllTimers();

        expect(res.status).toHaveBeenCalledWith(200);
        const clinics = res.json.mock.calls[0][0];
        expect(clinics.length).toBeGreaterThan(0);
        expect(clinics.every(clinic => clinic.services.includes('Dental Care'))).toBe(true);
        expect(clinics.some(c => c.id === "C002")).toBe(true); // C002 offers Dental Care
    });

    it('should filter clinics by name query parameter', async () => {
        const req = mockRequest({ name: 'Hope Medical' });
        const res = mockResponse();
        getClinics(req, res);
        jest.runAllTimers();

        expect(res.status).toHaveBeenCalledWith(200);
        const clinics = res.json.mock.calls[0][0];
        expect(clinics.length).toBe(1);
        expect(clinics[0].id).toBe("C001");
    });

    it('should return an empty array if no clinics match filters', async () => {
        const req = mockRequest({ region: 'NonExistentRegion123' });
        const res = mockResponse();
        getClinics(req, res);
        jest.runAllTimers();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
      });
  });

  describe('getClinicById', () => {
    it('should return a single clinic if ID exists', async () => {
      const req = mockRequest({}, { id: 'C001' });
      const res = mockResponse();
      getClinicById(req, res);
      jest.runAllTimers();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'C001',
        name: 'Hope Medical Center' // From mock data
      }));
    });

    it('should return 404 if clinic ID does not exist', async () => {
      const req = mockRequest({}, { id: 'NonExistentID123' });
      const res = mockResponse();
      getClinicById(req, res);
      jest.runAllTimers();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Clinic not found." });
    });
  });
});

// Clean up timers after all tests in this file are done
afterAll(() => {
  jest.useRealTimers();
});
