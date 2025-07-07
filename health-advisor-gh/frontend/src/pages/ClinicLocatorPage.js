import React, { useState, useEffect, useCallback } from 'react';
import { fetchClinics } from '../services/clinicService';
// import { Link } from 'react-router-dom'; // If linking to individual clinic detail pages

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const ClinicLocatorPage = () => {
  // const [clinics, setClinics] = useState([]); // Raw data from API if needed separately
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true for initial fetch
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState(''); // For general name search
  const [serviceSearch, setServiceSearch] = useState(''); // For service specific search
  const [regionFilter, setRegionFilter] = useState('');

  // Example regions for Ghana, can be expanded or fetched from backend
  const ghanaRegions = ["All Regions", "Greater Accra", "Ashanti", "Northern", "Central", "Volta", "Bono", "Eastern", "Upper East", "Upper West", "Western", "Oti", "Savannah", "North East", "Ahafo", "Western North"];


  const loadClinics = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const apiFilters = {};
      if (currentFilters.name) apiFilters.name = currentFilters.name;
      if (currentFilters.service) apiFilters.service = currentFilters.service;
      if (currentFilters.region && currentFilters.region !== "All Regions") apiFilters.region = currentFilters.region;

      console.log("Calling fetchClinics with filters:", apiFilters); // Debugging
      const data = await fetchClinics(apiFilters);
      // setClinics(data);
      setFilteredClinics(data);
    } catch (err) {
      console.error("Error fetching clinics in component:", err);
      setError(err.message || "Failed to load clinics. Please try again later.");
      // setClinics([]);
      setFilteredClinics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced version of loadClinics for text inputs
  const debouncedLoadClinics = useCallback(debounce(loadClinics, 400), [loadClinics]);

  // Initial load and on filter change
  useEffect(() => {
    const currentFilters = { name: searchTerm, service: serviceSearch, region: regionFilter };
    // Use debounced search for text inputs, direct for select dropdown
    if (searchTerm || serviceSearch) {
        debouncedLoadClinics(currentFilters);
    } else { // For region change or initial load (where searchTerm and serviceSearch are empty)
        loadClinics(currentFilters);
    }
  }, [searchTerm, serviceSearch, regionFilter, loadClinics, debouncedLoadClinics]);


  // Specific styles for this page, some might be replaceable by global classes
  const styles = {
    page: { maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    // title: { textAlign: 'center', color: '#2c3e50', marginBottom: '25px', fontSize: '2rem' }, // .page-title
    filtersContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' },
    // filterGroup: { display: 'flex', flexDirection: 'column' }, // .form-group can be used
    // label: { marginBottom: '6px', color: '#495057', fontSize: '0.9rem', fontWeight: 'bold' }, // .form-group label
    // input: { padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }, // .form-group input
    // select: { padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box', backgroundColor: 'white' }, // .form-group select
    clinicList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    // clinicCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 3px 10px rgba(0,0,0,0.07)', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }, // .card
    clinicName: { fontSize: '1.3rem', fontWeight: 'bold', color: '#007bff', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' },
    clinicDetail: { fontSize: '0.9rem', color: '#555', marginBottom: '7px', lineHeight: '1.6' },
    clinicServices: { marginTop: '12px' },
    servicesTitle: { fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px', color: '#333'},
    serviceTag: { display: 'inline-block', backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', borderRadius: '15px', marginRight: '6px', marginBottom: '6px', fontSize: '0.75rem' },
    // loading: { textAlign: 'center', fontSize: '1.2rem', padding: '40px', color: '#007bff' }, // .loading-message
    // error: { textAlign: 'center', fontSize: '1.1rem', padding: '25px', color: '#c0392b', backgroundColor: '#fdf2f2', borderRadius: '5px', border: '1px solid #f5c6cb' }, // .error-message
    noResults: { textAlign: 'center', fontSize: '1.1rem', padding: '40px', color: '#6c757d' } // Custom or .info-message
  };

  const handleMouseOverCard = (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)';};
  const handleMouseOutCard = (e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.07)';};

  return (
    <div style={styles.page}>
      <h2 className="page-title">Find a Clinic</h2>

      <div style={styles.filtersContainer}>
        <div className="form-group">
          <label htmlFor="searchTerm">Search by Clinic Name:</label>
          <input
            id="searchTerm" type="text" placeholder="e.g., Hope Medical"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            // Global input styles apply
          />
        </div>
        <div className="form-group">
          <label htmlFor="serviceSearch">Search by Service Offered:</label>
          <input
            id="serviceSearch" type="text" placeholder="e.g., Dental, Pediatrics"
            value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)}
            // Global input styles apply
          />
        </div>
        <div className="form-group">
          <label htmlFor="regionFilter">Filter by Region:</label>
          <select
            id="regionFilter" value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            // Global select styles apply
          >
            {ghanaRegions.map(region => (
              <option key={region} value={region === "All Regions" ? "" : region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="loading-message">Loading clinics...</div>}
      {error && <div className="error-message">{error}</div>}

      {!isLoading && !error && filteredClinics.length === 0 && (
        <div style={styles.noResults}>No clinics found matching your criteria. Please try different filters.</div>
      )}

      {!isLoading && !error && filteredClinics.length > 0 && (
        <div style={styles.clinicList}>
          {filteredClinics.map(clinic => (
            <div key={clinic.id} className="card" style={{transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'}} onMouseOver={handleMouseOverCard} onMouseOut={handleMouseOutCard}> {/* Use .card */}
              <h3 style={styles.clinicName}>{clinic.name}</h3>
              <p style={styles.clinicDetail}><strong>Address:</strong> {clinic.address}</p>
              <p style={styles.clinicDetail}><strong>Region:</strong> {clinic.region}</p>
              {clinic.contact?.phone && <p style={styles.clinicDetail}><strong>Phone:</strong> {clinic.contact.phone}</p>}
              {clinic.contact?.email && <p style={styles.clinicDetail}><strong>Email:</strong> <a href={`mailto:${clinic.contact.email}`} style={{color: '#007bff', textDecoration: 'none'}}>{clinic.contact.email}</a></p>}
              <p style={styles.clinicDetail}><strong>Hours:</strong> {clinic.operatingHours}</p>
              <p style={styles.clinicDetail}><strong>Cost Indication:</strong> {clinic.costIndication}</p>
              {clinic.notes && <p style={styles.clinicDetail}><em>Note: {clinic.notes}</em></p>}
              {clinic.website && <p style={styles.clinicDetail}><a href={clinic.website} target="_blank" rel="noopener noreferrer" style={{color: '#007bff', textDecoration: 'none'}}>Visit Website &#x2197;</a></p>}

              {clinic.services && clinic.services.length > 0 && (
                <div style={styles.clinicServices}>
                  <strong style={styles.servicesTitle}>Services:</strong>
                  <div>
                    {clinic.services.map(service => (
                      <span key={service} style={styles.serviceTag}>{service}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Individual clinic detail page link could be: <Link to={`/clinics/${clinic.id}`}>View More Details</Link> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicLocatorPage;
