// Mock Clinic Data
const mockClinics = [
  {
    id: "C001",
    name: "Hope Medical Center",
    address: "Liberation Rd, Accra, Ghana",
    region: "Greater Accra",
    coordinates: { lat: 5.5817, lng: -0.1982 }, // Approximate
    contact: { phone: "+233 30 211 2233", email: "contact@hopemc.gh" },
    services: ["General Consultation", "Pediatrics", "Maternity", "Pharmacy", "Lab Services"],
    operatingHours: "Mon-Sat: 8:00 AM - 7:00 PM, Sun: Closed",
    costIndication: "Medium (Consultation: GHS 50-100)",
    notes: "NHIS accredited. Walk-ins welcome. Limited evening appointments available.",
    website: "http://hopemc.gh.example.com" // Example placeholder
  },
  {
    id: "C002",
    name: "Kumasi City Clinic",
    address: "Bantama High St, Kumasi, Ghana",
    region: "Ashanti",
    coordinates: { lat: 6.6998, lng: -1.6207 }, // Approximate
    contact: { phone: "+233 32 200 1020", email: "info@kumasiclinic.example.org" },
    services: ["General Medicine", "Lab Services", "Dental Care", "Eye Care", "Vaccinations"],
    operatingHours: "Mon-Fri: 7:30 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM",
    costIndication: "Low (Consultation: GHS 30-70)",
    notes: "Focus on affordable community healthcare. Appointment preferred for dental/eye care.",
    website: null
  },
  {
    id: "C003",
    name: "Tamale Teaching Hospital (Outpatient Dept.)",
    address: "Hospital Rd, Tamale, Ghana",
    region: "Northern",
    coordinates: { lat: 9.4100, lng: -0.8500 }, // Approximate
    contact: { phone: "+233 37 202 2781" },
    services: ["Specialist Consultations", "General Consultation", "Emergency Services", "Radiology", "Physiotherapy"],
    operatingHours: "24/7 (Emergency), Mon-Fri: 8AM - 4PM (Outpatient Clinics for appointments)",
    costIndication: "Varies (Public Teaching Hospital, NHIS accepted for many services)",
    notes: "Major referral hospital. Expect longer wait times for some specialists without prior appointment.",
    website: "http://tth.gov.gh.example.com"
  },
  {
    id: "C004",
    name: "Cape Coast Metropolitan Hospital",
    address: "Hospital Link Rd, Cape Coast, Ghana",
    region: "Central",
    coordinates: { lat: 5.1053, lng: -1.2466 }, // Approximate
    contact: { phone: "+233 33 213 2255" },
    services: ["General Medicine", "Surgery", "Pediatrics", "Obstetrics & Gynecology", "Emergency Services"],
    operatingHours: "24/7 for Emergency; Clinics: Mon-Fri, 8 AM - 5 PM",
    costIndication: "Medium (NHIS accepted)",
    notes: "Serves Cape Coast and surrounding areas. Key government hospital.",
    website: null
  },
  {
    id: "C005",
    name: "Volta Regional Hospital (Ho)",
    address: "Trafalgar, Ho, Ghana",
    region: "Volta",
    coordinates: { lat: 6.6103, lng: 0.4713 }, // Approximate
    contact: { phone: "+233 36 202 6401", email: "info@vrhho.example.com" },
    services: ["General Consultation", "Maternity & Child Health", "Pediatrics", "Public Health Services", "Surgery"],
    operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM; 24/7 Emergency Services",
    costIndication: "Low to Medium (NHIS widely used)",
    notes: "Key hospital in the Volta Region. Also known as 'Trafalgar'.",
    website: "http://vrh.gov.gh.example.com"
  },
  {
    id: "C006",
    name: "Sunyani Municipal Hospital",
    address: "Hospital Road, Sunyani, Bono Region",
    region: "Bono",
    coordinates: { lat: 7.3362, lng: -2.3287 }, // Approximate
    contact: { phone: "+233 35 202 7148" },
    services: ["General Medicine", "Emergency", "Maternity", "Pharmacy"],
    operatingHours: "24/7",
    costIndication: "Low to Medium",
    notes: "Primary government hospital in Sunyani.",
    website: null
  },
  {
    id: "C007",
    name: "East Legon Wellness Clinic",
    address: "No. 10, Jasmine Street, East Legon, Accra",
    region: "Greater Accra",
    coordinates: { lat: 5.6360, lng: -0.1618 }, // Approximate
    contact: { phone: "+233 55 789 1234", email: "appointments@elwellness.example.com" },
    services: ["General Consultation", "Wellness Checks", "Nutrition Counseling", "Physiotherapy", "Vaccinations"],
    operatingHours: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 2:00 PM",
    costIndication: "High (Private clinic, some insurance accepted)",
    notes: "Focus on preventive care and wellness. Appointment based.",
    website: "http://elwellness.example.com"
  }
];

exports.getClinics = async (req, res) => {
  const { region, service, name, cost } = req.query; // Added cost filter
  let filteredClinics = [...mockClinics];

  if (region) {
    filteredClinics = filteredClinics.filter(clinic =>
      clinic.region && clinic.region.toLowerCase().includes(region.toLowerCase())
    );
  }

  if (service) {
    filteredClinics = filteredClinics.filter(clinic =>
      clinic.services.some(s => s.toLowerCase().includes(service.toLowerCase()))
    );
  }

  if (name) {
    filteredClinics = filteredClinics.filter(clinic =>
      clinic.name && clinic.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (cost) { // Example: cost=low, cost=medium, cost=high
    filteredClinics = filteredClinics.filter(clinic =>
        clinic.costIndication && clinic.costIndication.toLowerCase().startsWith(cost.toLowerCase())
    );
  }

  // Simulate a small delay
  setTimeout(() => {
    // For a real app, you'd also handle pagination here
    res.status(200).json(filteredClinics); // Send empty array if no clinics match
  }, 200 + Math.random() * 200); // Shorter delay
};

exports.getClinicById = async (req, res) => {
    const { id } = req.params;
    const clinic = mockClinics.find(c => c.id === id);

    setTimeout(() => { // Simulate delay
        if (clinic) {
            res.status(200).json(clinic);
        } else {
            res.status(404).json({ message: "Clinic not found." });
        }
    }, 100 + Math.random() * 100);
};
