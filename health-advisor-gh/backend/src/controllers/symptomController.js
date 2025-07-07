// Mock AI Symptom Checker Logic

const mockDiagnoses = [
  {
    id: 1,
    keywords: ["fever", "cough", "sore throat", "runny nose", "headache", "fatigue", "body ache"],
    potentialIssues: [
      { name: "Common Cold", advice: "Rest, drink plenty of fluids (water, broth, juice), manage fever with appropriate medication (e.g., paracetamol/acetaminophen or ibuprofen). Use saline nasal sprays for congestion. Symptoms usually resolve in 7-10 days." },
      { name: "Influenza (Flu)", advice: "Rest extensively, stay well-hydrated. Antiviral medication (e.g., oseltamivir) may be prescribed by a doctor if diagnosed early (within 48 hours of symptom onset), especially for high-risk individuals. Manage fever and aches. Isolate yourself to prevent spread." }
    ],
    recommendations: "Over-the-counter medications can help manage symptoms like pain, fever, and cough. If symptoms are severe (e.g., high persistent fever, difficulty breathing, chest pain, confusion, bluish lips) or if you belong to a high-risk group (elderly, young children, pregnant women, chronic health conditions), consult a healthcare provider promptly.",
    requiresUrgentCare: false, // Can become true if severe symptoms develop
  },
  {
    id: 2,
    keywords: ["rash", "itchy skin", "redness", "hives", "welts"],
    potentialIssues: [
      { name: "Allergic Reaction (skin)", advice: "Identify and avoid the suspected allergen if known. Apply cool compresses. Topical creams (like hydrocortisone 1%) or oral antihistamines (e.g., cetirizine, loratadine) may help relieve itching and reduce rash. If swelling of the face/lips/tongue or difficulty breathing occurs, this is an emergency (anaphylaxis) – seek immediate emergency care (call emergency services)." },
      { name: "Eczema (Atopic Dermatitis) Flare-up", advice: "Moisturize skin frequently with a thick, fragrance-free moisturizer. Avoid known triggers (e.g., harsh soaps, allergens, stress). Short, lukewarm baths can help. A doctor may prescribe topical corticosteroids or other medications for more severe flare-ups." },
      { name: "Contact Dermatitis", advice: "Identify and avoid the irritant or allergen (e.g., certain plants like poison ivy, nickel in jewelry, fragrances). Wash the affected area gently. Calamine lotion or hydrocortisone cream can soothe itching. Oral antihistamines may help."}
    ],
    recommendations: "If the rash is widespread, painful, blistering, shows signs of infection (pus, warmth, red streaks), or is accompanied by fever, see a doctor. For severe allergic reactions with breathing difficulty or swelling, seek emergency medical attention immediately.",
    requiresUrgentCare: false, // Note: ANAPHYLAXIS IS URGENT. This mock needs refinement for such cases.
  },
  {
    id: 3,
    keywords: ["stomach pain", "abdominal pain", "nausea", "vomiting", "diarrhea", "cramps"],
    potentialIssues: [
      { name: "Gastroenteritis (Stomach Flu/Bug)", advice: "Focus on staying hydrated with clear fluids (water, oral rehydration solutions like Pedialyte, diluted fruit juice, clear broths). Gradually reintroduce bland foods (BRAT diet - bananas, rice, applesauce, toast) as tolerated. Get plenty of rest." },
      { name: "Food Poisoning", advice: "Rest and drink plenty of fluids to prevent dehydration. Most cases are mild and resolve on their own within a few days. Avoid dairy, fatty foods, and spicy foods initially. If symptoms are severe (e.g., high fever, bloody stools, signs of dehydration like dizziness or scant urination), last more than 2-3 days, or if you are pregnant or elderly, consult a doctor."}
    ],
    recommendations: "Practice good hygiene (handwashing) to prevent spread. Ensure food is cooked thoroughly and stored properly. If dehydration is suspected (dry mouth, dizziness, dark urine), or symptoms are severe or prolonged, seek medical attention.",
    requiresUrgentCare: false,
  },
  {
    id: 5, // More specific than default, less specific than others
    keywords: ["tired", "weak", "dizzy"],
    potentialIssues: [
        { name: "General Fatigue/Possible Dehydration", advice: "Ensure you are getting adequate rest and sleep. Drink plenty of fluids throughout the day. Review your diet for balanced nutrition. If fatigue is persistent or severe, consult a doctor to rule out underlying conditions."}
    ],
    recommendations: "Monitor your symptoms. If fatigue is debilitating, accompanied by other concerning symptoms, or doesn't improve with rest and hydration, seek medical advice.",
    requiresUrgentCare: false,
  },
  {
    id: 4, // Default/Fallback for very generic or unmatchable input
    keywords: [], // Intentionally empty to act as a catch-all if no other keywords match
    potentialIssues: [
      { name: "Non-specific Symptoms Reported", advice: "The symptoms you've described are general. It's important to monitor them closely for any changes or new developments." }
    ],
    recommendations: "If you are concerned, your symptoms worsen, persist for more than a few days, or if new, more specific symptoms arise, please consult a healthcare professional for an accurate diagnosis and personalized advice. This tool provides preliminary information and is not a substitute for professional medical evaluation.",
    requiresUrgentCare: false,
  }
];

exports.checkSymptoms = async (req, res) => {
  const { symptomsDescription } = req.body;

  if (!symptomsDescription || typeof symptomsDescription !== 'string' || symptomsDescription.trim() === "") {
    return res.status(400).json({
      message: "Symptom description is required and must be a non-empty string.",
      disclaimer: "This tool requires a description of your symptoms to provide information. Please try again with some input."
    });
  }

  const inputText = symptomsDescription.toLowerCase().trim();
  let matchedDiagnosis = null;
  let bestMatchScore = 0;

  // Find the best match based on keyword count
  for (const diagnosis of mockDiagnoses) {
    if (diagnosis.id === 4) continue; // Skip default for keyword matching initially

    let currentScore = 0;
    for (const kw of diagnosis.keywords) {
        if (inputText.includes(kw)) {
            currentScore++;
        }
    }

    if (currentScore > 0 && currentScore >= bestMatchScore) { // Prioritize more specific matches
        // If scores are equal, we could add more logic (e.g. prefer shorter keyword lists, or specific keywords)
        // For now, if scores are equal, the one appearing earlier in mockDiagnoses (with more keywords usually) might be preferred.
        // Or, we could make it so that a higher number of matching keywords for a more specific diagnosis wins.
        // This logic can be refined. For now, any improvement in score takes precedence.
        if (currentScore > bestMatchScore) {
            bestMatchScore = currentScore;
            matchedDiagnosis = diagnosis;
        } else if (matchedDiagnosis && diagnosis.keywords.length < matchedDiagnosis.keywords.length) {
            // Prefer more specific (fewer keywords but all match) if score is same
            // This part of logic might need more thought.
            // Let's simplify: if score is same, first one encountered with that score wins (unless explicitly overridden)
            // For now, let's stick to: if currentScore > bestMatchScore, it's a new best. If equal, it depends on order or other criteria.
            // The current loop structure will favor earlier definitions if scores are identical and both > 0.
            // To make it more robust, we could collect all matches with the same bestMatchScore and decide.
            // For this mock, simple "first best match" is okay.
             if (!matchedDiagnosis) matchedDiagnosis = diagnosis; // if no match yet, take it
        }
    }
  }

  if (!matchedDiagnosis && inputText.length > 0) { // If no keywords matched but there was input
    matchedDiagnosis = mockDiagnoses.find(diag => diag.id === 5) || mockDiagnoses.find(diag => diag.id === 4); // Try general fatigue or default
  } else if (!matchedDiagnosis) { // Should not happen if input is validated, but as a fallback
    matchedDiagnosis = mockDiagnoses.find(diag => diag.id === 4);
  }


  // Simulate a delay as if an AI was processing
  setTimeout(() => {
    if (!matchedDiagnosis) { // Should ideally not be reached if default is always found
        matchedDiagnosis = mockDiagnoses.find(diag => diag.id === 4);
    }
    res.status(200).json({
      userInput: symptomsDescription,
      potentialIssues: matchedDiagnosis.potentialIssues,
      recommendations: matchedDiagnosis.recommendations,
      requiresUrgentCare: matchedDiagnosis.requiresUrgentCare,
      matchedKeywordsCount: bestMatchScore, // For debugging/interest
      matchedDiagnosisId: matchedDiagnosis.id, // For debugging/interest
      disclaimer: "IMPORTANT: This AI-powered symptom checker provides preliminary information based on common symptoms and is for informational purposes only. It should NOT be considered a substitute for professional medical diagnosis, advice, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately."
    });
  }, 500 + Math.random() * 800); // Simulate 0.5-1.3 second delay
};
