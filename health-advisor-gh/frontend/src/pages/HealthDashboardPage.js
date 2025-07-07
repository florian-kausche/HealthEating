import React, { useState, useEffect, useCallback } from 'react';
import { fetchHealthContents } from '../services/healthContentService';
// import { Link } from 'react-router-dom'; // For linking to full article pages later

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

const HealthDashboardPage = () => {
  const [contentItems, setContentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // e.g., "Nutrition", "Exercise"
  const [typeFilter, setTypeFilter] = useState(''); // e.g., "tip", "article_summary"

  // Categories and types should ideally be fetched or be more dynamic
  const categories = ["All", "Nutrition", "Exercise", "Mental Wellness", "Hygiene", "Disease Prevention", "Sleep"];
  const types = ["All", "tip", "article_summary"];


  const loadHealthContent = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const apiFilters = {};
      if (currentFilters.search) apiFilters.search = currentFilters.search;
      if (currentFilters.category && currentFilters.category !== "All") apiFilters.category = currentFilters.category;
      if (currentFilters.type && currentFilters.type !== "All") apiFilters.type = currentFilters.type;

      const data = await fetchHealthContents(apiFilters);
      setContentItems(data);
    } catch (err) {
      console.error("Error fetching health content:", err);
      setError(err.message || "Failed to load health information.");
      setContentItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced version for search term input
  const debouncedLoadContent = useCallback(debounce(loadHealthContent, 400), [loadHealthContent]);

  useEffect(() => {
    const currentFilters = { search: searchTerm, category: categoryFilter, type: typeFilter };
    if (searchTerm) {
        debouncedLoadContent(currentFilters);
    } else { // Load immediately for category/type changes or initial load (searchTerm is empty)
        loadHealthContent(currentFilters);
    }
  }, [searchTerm, categoryFilter, typeFilter, loadHealthContent, debouncedLoadContent]);

  // Keep specific card layout styles inline, but use global classes for page structure, forms, messages
  const styles = {
    // page: { maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }, // Base page padding from .main-content
    // title: { textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: '2.2rem', fontWeight: '600' }, // .page-title
    filtersContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' },
    // filterGroup: { display: 'flex', flexDirection: 'column' }, // .form-group
    // label: { marginBottom: '8px', color: '#555', fontSize: '0.95rem', fontWeight: '500' }, // .form-group label
    // input / select will use global styles
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    // contentCard: { border: '1px solid #e9e9e9', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }, // .card base
    cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
    cardBody: { padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
    cardCategory: { fontSize: '0.8rem', color: '#007bff', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' },
    cardTitle: { fontSize: '1.3rem', fontWeight: 'bold', color: '#333', marginBottom: '10px', lineHeight: '1.3', minHeight: 'calc(1.3em * 1.3 * 2)' },
    cardSummary: { fontSize: '0.95rem', color: '#555', marginBottom: '15px', lineHeight: '1.6', flexGrow: 1 },
    cardSource: { fontSize: '0.8rem', fontStyle: 'italic', color: '#777', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0' },
    cardTags: { marginTop: '12px', marginBottom: '8px' },
    tag: { display: 'inline-block', backgroundColor: '#6c757d', color: 'white', padding: '4px 9px', borderRadius: '12px', marginRight: '6px', marginBottom: '6px', fontSize: '0.75rem' },
    // loading: { textAlign: 'center', fontSize: '1.3rem', padding: '50px', color: '#007bff' }, // .loading-message
    // error: { textAlign: 'center', fontSize: '1.1rem', padding: '30px', color: '#d9534f', backgroundColor: '#f2dede', borderRadius: '5px', border: '1px solid #ebccd1' }, // .error-message
    noResults: { textAlign: 'center', fontSize: '1.1rem', padding: '50px', color: '#666' } // Custom or .info-message
  };

  const handleCardMouseOver = (e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'; };
  const handleCardMouseOut = (e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)'; };


  return (
    <div style={{fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}> {/* Page font from body, specific page padding from .main-content */}
      <h2 className="page-title">Health Hub: Tips & Education</h2>

      <div style={styles.filtersContainer}>
        <div className="form-group">
          <label htmlFor="searchTerm">Search by Keyword/Tag:</label>
          <input id="searchTerm" type="text" placeholder="e.g., diet, malaria, stress" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => (<option key={cat} value={cat === "All" ? "" : cat}>{cat}</option>))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="typeFilter">Filter by Content Type:</label>
          <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {types.map(typ => (<option key={typ} value={typ === "All" ? "" : typ}>{typ.replace("_summary", " Article")}</option>))}
          </select>
        </div>
      </div>

      {isLoading && <div className="loading-message">Loading health information...</div>}
      {error && <div className="error-message">{error}</div>}

      {!isLoading && !error && contentItems.length === 0 && (
        <div style={styles.noResults}>No health information found matching your criteria. Please try different filters.</div>
      )}

      {!isLoading && !error && contentItems.length > 0 && (
        <div style={styles.contentGrid}>
          {contentItems.map(item => (
            <div key={item.id} className="card" style={{display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease'}} onMouseOver={handleCardMouseOver} onMouseOut={handleCardMouseOut}>
              <img
                src={process.env.PUBLIC_URL + (item.imageUrl || "/images/mock/default_health.jpg")}
                alt={item.title}
                style={styles.cardImage}
                onError={(e) => { e.target.onerror = null; e.target.src= process.env.PUBLIC_URL + "/images/mock/default_health.jpg"; }}
              />
              <div style={styles.cardBody}>
                <p style={styles.cardCategory}>{item.category}</p>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardSummary}>{item.summary}</p>
                {item.tags && item.tags.length > 0 && (
                  <div style={styles.cardTags}>
                    {item.tags.map(tag => <span key={tag} style={styles.tag}>#{tag}</span>)}
                  </div>
                )}
                {item.source && <p style={styles.cardSource}>Source: {item.source}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthDashboardPage;
