import React, { useState } from 'react';
import { submitSymptomsForCheck } from '../services/symptomService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // For potential redirect

const SymptomCheckerPage = () => {
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsDescription.trim()) {
      setError("Please describe your symptoms.");
      setResults(null);
      return;
    }
    if (!currentUser) {
        setError("You must be logged in to use the symptom checker. Redirecting to login...");
        setResults(null);
        setTimeout(() => navigate('/login'), 2000); // Give user time to see message
        return;
    }

    setError('');
    setLoading(true);
    setResults(null); // Clear previous results

    try {
      const data = await submitSymptomsForCheck(symptomsDescription);
      setResults(data);
    } catch (err) {
      console.error("SymptomCheckerPage error:", err);
      setError(err.message || "An error occurred while checking symptoms.");
      setResults(null); // Clear results on error
    } finally {
      setLoading(false);
    }
  };

  // Inline styles (consider moving to a CSS module or styled-components for larger apps)
  // Most specific styles will remain inline if they don't have a global equivalent yet
  // or are highly specific to this page's layout.
  const styles = {
    // container: { maxWidth: '700px', margin: '20px auto', padding: '25px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' },
    // title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontSize: '1.8rem' }, // Will use .page-title
    // formGroup: { marginBottom: '20px' }, // Will use .form-group
    // label: { display: 'block', marginBottom: '10px', fontWeight: '600', color: '#34495e', fontSize: '1.05rem' }, // Will use .form-group label
    // textarea: { width: '100%', minHeight: '120px', padding: '12px', boxSizing: 'border-box', border: '1px solid #bdc3c7', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }, // Will use .form-group textarea
    // button: { display: 'block', width: '100%', padding: '12px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', transition: 'background-color 0.3s ease', opacity: loading ? 0.7 : 1 }, // Will use .btn .btn-primary
    resultsContainer: { marginTop: '35px', padding: '20px', backgroundColor: '#f8f9f9', borderRadius: '8px', border: '1px solid #e9ecef' }, // Custom class or .card
    resultsHeader: { fontSize: '1.6rem', color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #007bff', paddingBottom: '10px' },
    userInputDisplay: { fontStyle: 'italic', color: '#555', marginBottom: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', borderLeft: '4px solid #007bff'},
    potentialIssuesTitle: { fontSize: '1.3rem', color: '#34495e', marginTop: '20px', marginBottom: '10px'},
    issueCard: { backgroundColor: '#fff', border: '1px solid #dcdcdc', padding: '18px', marginBottom: '18px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }, // Can be .card
    issueName: { fontSize: '1.25rem', fontWeight: 'bold', color: '#0056b3', marginBottom: '8px' }, // Darker blue
    advice: { fontSize: '1rem', color: '#34495e', lineHeight: '1.6' },
    recommendationsTitle: { fontSize: '1.3rem', color: '#34495e', marginTop: '25px', marginBottom: '10px'},
    recommendationsText: { fontSize: '1rem', color: '#34495e', lineHeight: '1.6', padding: '15px', backgroundColor: '#e9f5fd', borderRadius: '4px', borderLeft: '4px solid #17a2b8'}, // Info color
    urgentCare: { marginTop: '20px', fontSize: '1rem', fontWeight: 'bold', padding: '10px', borderRadius: '4px' },
    urgentCareYes: { color: '#c0392b', backgroundColor: '#fdeded', borderLeft: '4px solid #c0392b' },
    urgentCareNo: { color: '#27ae60', backgroundColor: '#eafaf1', borderLeft: '4px solid #27ae60' },
    disclaimer: { marginTop: '30px', fontSize: '0.9rem', color: '#6c757d', fontStyle: 'italic', borderTop: '1px dashed #ced4da', paddingTop: '20px', lineHeight: '1.5' },
  };


  return (
    // Using a general container class that might be defined (e.g. in App.js or App.css for page content)
    // For now, let's use a simple div and apply some global styles via classes.
    <div className="page-container" style={{maxWidth: '800px', margin: '0 auto'}}>
      <h2 className="page-title">AI-Powered Symptom Checker</h2>

      {/* form-container could be used if defined globally for forms, or keep it simple */}
      <form onSubmit={handleSubmit} className="card" style={{padding: '25px'}}>
        <div className="form-group">
          <label htmlFor="symptomsDescription">
            Please describe your symptoms in detail:
          </label>
          <textarea
            id="symptomsDescription"
            value={symptomsDescription}
            onChange={(e) => setSymptomsDescription(e.target.value)}
            placeholder="Example: I have a high fever, persistent cough for 3 days, and body aches."
            rows={6}
            // Styling from global .form-group textarea
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{width: '100%', marginTop: '10px'}} // Block button
          disabled={loading}
        >
          {loading ? 'Analyzing Symptoms...' : 'Check Symptoms'}
        </button>
      </form>

      {loading && <div className="loading-message" style={{marginTop: '20px'}}>Fetching analysis... Please wait.</div>}
      {error && <p className="error-message" style={{marginTop: '20px'}}>{error}</p>}

      {results && (
        <div className="card" style={{marginTop: '30px', ...styles.resultsContainer}}> {/* Using .card and merging specific styles */}
          <h3 style={styles.resultsHeader}>Symptom Analysis Results</h3>
          {results.userInput && <p style={styles.userInputDisplay}><strong>Your Input:</strong> "{results.userInput}"</p>}

          <h4 style={styles.potentialIssuesTitle}>Potential Issues:</h4>
          {results.potentialIssues && results.potentialIssues.length > 0 ? (
            results.potentialIssues.map((issue, index) => (
              <div key={index} className="card" style={{...styles.issueCard, marginBottom:'15px'}}> {/* Nested card */}
                <p style={styles.issueName}>{issue.name}</p>
                <p style={styles.advice}><strong>Medical Advice:</strong> {issue.advice}</p>
              </div>
            ))
          ) : (
            <p>No specific potential issues were identified based on your input. Please see the general recommendations below.</p>
          )}

          {results.recommendations && (
            <>
              <h4 style={styles.recommendationsTitle}>General Recommendations:</h4>
              <p style={styles.recommendationsText}>{results.recommendations}</p>
            </>
          )}

          {typeof results.requiresUrgentCare === 'boolean' && (
             <p style={{...styles.urgentCare, ...(results.requiresUrgentCare ? styles.urgentCareYes : styles.urgentCareNo)}}>
                <strong>Urgent Care Potentially Needed: </strong>
                <span> {/* Span for the text part */}
                    {results.requiresUrgentCare ? "Yes, based on the information, consider seeking prompt medical attention, especially if symptoms are severe or rapidly worsening." : "No, based on current information, urgent care is likely not immediately required. However, continue to monitor your symptoms closely."}
                </span>
            </p>
          )}

          {results.disclaimer && (
            <p style={styles.disclaimer}>{results.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SymptomCheckerPage;
