import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToBot } from '../services/chatbotService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]); // Stores { id, sender: 'user'/'bot', text: 'message content' }
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // For auto-scrolling
  const inputRef = useRef(null); // For focusing input

  // Effect to scroll to the bottom of messages list when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting from bot
  useEffect(() => {
    if (currentUser && messages.length === 0) {
      setMessages([{ id: Date.now(), sender: 'bot', text: "Hello! I'm your general health information chatbot. How can I assist you today?" }]);
      setSuggestions(["Ask about healthy diet", "Tips for exercise", "How to manage stress?"]);
      inputRef.current?.focus(); // Focus input on load
    }
     // If user is not logged in but somehow reaches this page (e.g. direct navigation after session expiry)
    if (!currentUser && messages.length === 0) {
        setError("Please login to use the chatbot.");
        // Consider redirecting or disabling input if not logged in
        // setTimeout(() => navigate('/login'), 3000);
    }
  }, [currentUser, messages.length, navigate]);


  const handleSendMessage = async (messageText) => {
    const textToProcess = messageText.trim();
    if (!textToProcess) return;

    if (!currentUser) {
        setError("Authentication error. Please make sure you are logged in.");
        // Optionally navigate to login
        // navigate('/login');
        return;
    }

    const newUserMessage = { id: Date.now(), sender: 'user', text: textToProcess };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const botData = await sendMessageToBot(textToProcess);
      const newBotMessage = { id: Date.now() + 1, sender: 'bot', text: botData.response }; // Ensure unique ID
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
      if (botData.suggestions && botData.suggestions.length > 0) {
        setSuggestions(botData.suggestions);
      }
    } catch (err) {
      console.error("ChatbotPage error:", err);
      const errorMessage = err.message || "Error communicating with the chatbot.";
      setError(errorMessage);
      setMessages(prevMessages => [...prevMessages, {id: Date.now() + 1, sender: 'bot', text: `Sorry, I encountered an error: ${errorMessage}. Please try again.`}]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus(); // Re-focus input after bot response
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Don't setInputValue here, directly send the suggestion
    handleSendMessage(suggestion);
  };

  // Keep chat-specific styles inline for now, or move to a Chatbot.css if it grows
  const styles = {
    pageContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', margin: '0 auto', maxWidth: '700px', border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
    // header: { textAlign: 'center', padding: '15px 0', margin:0, borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', fontSize: '1.5rem', color: '#333'}, // Will use .page-title
    messagesContainer: { flexGrow: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f4f7f6' },
    messageWrapper: (isUser) => ({
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
    }),
    messageBubble: (isUser) => ({
      maxWidth: '75%',
      padding: '10px 16px',
      borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
      backgroundColor: isUser ? '#007bff' : '#e9ecef', // Using .btn-primary color for user
      color: isUser ? 'white' : '#333',
      lineHeight: '1.4',
      wordWrap: 'break-word',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    }),
    suggestionsContainer: { padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#fff', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
    // suggestionButton: { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background-color 0.2s ease' }, // Will use .btn .btn-sm or similar
    inputArea: { display: 'flex', padding: '12px', borderTop: '1px solid #ddd', backgroundColor: '#fff', alignItems: 'center' }, // Align items for button height
    // inputField: { flexGrow: 1, padding: '12px 15px', border: '1px solid #ccc', borderRadius: '25px', marginRight: '10px', fontSize: '1rem', outline: 'none' }, // Will use global input style
    // sendButton: { padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s ease' }, // Will use .btn .btn-primary
  };

  return (
    <div style={styles.pageContainer}>
      <h2 className="page-title" style={{padding: '15px 0', margin:0, borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', fontSize: '1.8rem'}}>Health Information Chatbot</h2> {/* Applied .page-title and some inline overrides */}
      {error && <div className="error-message" style={{borderRadius: 0, margin:0}}>{error}</div>} {/* Global error class, remove border radius and margin for chat context */}

      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} style={styles.messageWrapper(msg.sender === 'user')}>
            <div style={styles.messageBubble(msg.sender === 'user')}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading &&
            <div style={styles.messageWrapper(false)}>
                <div style={{...styles.messageBubble(false), fontStyle: 'italic', color: '#555'}}>Thinking...</div>
            </div>
        }
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && !isLoading && (
        <div style={styles.suggestionsContainer}>
          {suggestions.map((sug, index) => (
            <button
                key={index}
                onClick={() => handleSuggestionClick(sug)}
                className="btn btn-secondary" // Using global button style
                style={{ borderRadius: '20px', fontSize: '0.85rem', padding: '6px 12px' }} // Custom roundness and size
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} style={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          // Global input styles from .form-group input will apply if wrapped, or manually apply similar styling
          style={{flexGrow: 1, padding: '10px 15px', border: '1px solid #ccc', borderRadius: '25px', marginRight: '10px', fontSize: '1rem', outline: 'none'}}
          placeholder="Type your health question here..."
          disabled={isLoading || !currentUser}
        />
        <button
            type="submit"
            className="btn btn-primary" // Global button style
            style={{borderRadius: '25px'}} // Custom roundness
            disabled={isLoading || !currentUser}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotPage;
