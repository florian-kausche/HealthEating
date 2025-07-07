// Mock Health Tips and Education Content
const mockHealthContent = [
  {
    id: "N001",
    type: "tip", // "tip", "article_summary", "video_link" (video_link not used yet)
    category: "Nutrition",
    title: "Eat a Balanced Diet Daily",
    summary: "Consume a variety of foods including fruits, vegetables, whole grains, lean proteins, and healthy fats to ensure you get essential nutrients for optimal health.",
    content: "A balanced diet provides the energy you need to keep active throughout the day and nutrients for growth and repair, helping you to stay strong and healthy and help to prevent diet-related illness, such as some cancers. Aim for at least 5 servings of fruits and vegetables per day. Choose whole grains like brown rice, millet, or oats over refined grains. Include diverse protein sources such as beans, lentils, fish, poultry, or lean meat.",
    imageUrl: "/images/mock/nutrition_balanced_diet.jpg", // Placeholder image path
    source: "Ghana Health Service",
    tags: ["diet", "healthy eating", "vegetables", "fruits", "protein"]
  },
  {
    id: "E001",
    type: "tip",
    category: "Exercise",
    title: "Stay Physically Active Every Day",
    summary: "Aim for at least 30 minutes of moderate-intensity physical activity (like brisk walking, cycling, or dancing) on most days of the week.",
    content: "Regular physical activity is crucial for maintaining a healthy weight, strengthening bones and muscles, improving cardiovascular health, boosting mood, and reducing the risk of chronic diseases like heart disease, diabetes, and some forms. Find activities you genuinely enjoy to make it a sustainable part of your lifestyle.",
    imageUrl: "/images/mock/exercise_stay_active.jpg",
    source: "WHO Guidelines",
    tags: ["fitness", "activity", "walking", "heart health", "weight management"]
  },
  {
    id: "M001",
    type: "article_summary",
    category: "Mental Wellness",
    title: "Practice Mindfulness for Stress Relief",
    summary: "Mindfulness involves paying attention to the present moment without judgment. Regular practice can significantly help reduce stress, improve focus, and enhance emotional regulation.",
    content: "You can practice mindfulness through various techniques such as guided meditation, deep breathing exercises, or by simply focusing on your senses during everyday activities like walking or eating. Even dedicating a few minutes each day can make a substantial difference to your mental well-being. If stress becomes overwhelming or persistent, consider talking to a healthcare professional or a counselor.",
    imageUrl: "/images/mock/mental_wellness_mindfulness.jpg",
    source: "Mental Health Authority of Ghana",
    tags: ["stress reduction", "meditation", "anxiety", "emotional health", "self-care"]
  },
  {
    id: "H001",
    type: "tip",
    category: "Hygiene",
    title: "Wash Your Hands Frequently and Thoroughly",
    summary: "Wash your hands regularly with soap and running water for at least 20 seconds. This is especially important before eating, after using the restroom, and after coughing or sneezing.",
    content: "Proper handwashing is one of the most effective and simplest ways to prevent the spread of many types of infections and illnesses, including common colds, flu, and diarrheal diseases. If soap and water are not readily available, use an alcohol-based hand sanitizer that contains at least 60% alcohol.",
    imageUrl: "/images/mock/hygiene_handwashing.jpg",
    source: "Community Health Nurses Association",
    tags: ["handwashing", "infection prevention", "cleanliness", "germs"]
  },
  {
    id: "D001",
    type: "article_summary",
    category: "Disease Prevention",
    title: "Understanding and Preventing Malaria",
    summary: "Malaria is a significant public health concern in Ghana. Key prevention methods include consistently sleeping under insecticide-treated nets (ITNs), using insect repellent, and participating in environmental management to reduce mosquito breeding sites.",
    content: "Early diagnosis and prompt, effective treatment are crucial for managing malaria and preventing complications. If you experience symptoms like fever, chills, headache, and body aches, it is important to seek medical attention from a qualified healthcare provider without delay. Pregnant women and young children are particularly vulnerable to severe malaria.",
    imageUrl: "/images/mock/disease_malaria_prevention.jpg",
    source: "National Malaria Elimination Programme, Ghana",
    tags: ["malaria", "mosquitoes", "ITN", "fever", "public health"]
  },
  {
    id: "N002",
    type: "tip",
    category: "Nutrition",
    title: "Limit Processed Foods & Sugary Drinks",
    summary: "Reduce your intake of highly processed foods, which are often high in salt, unhealthy fats, and added sugar. Opt for fresh, whole foods whenever possible. Also, limit sugary drinks like sodas and sweetened juices.",
    content: "High consumption of processed foods and sugary drinks is strongly linked to an increased risk of obesity, type 2 diabetes, heart disease, and various other chronic health problems. Make it a habit to read food labels to make informed choices about what you consume and to understand the nutritional content of packaged foods.",
    imageUrl: "/images/mock/nutrition_limit_processed.jpg",
    source: "Ghana Dietetic Association",
    tags: ["processed food", "sugar", "healthy choices", "obesity prevention", "diabetes"]
  },
  {
    id: "S001",
    type: "tip",
    category: "Sleep",
    title: "Prioritize Getting Quality Sleep",
    summary: "Aim for 7-9 hours of quality sleep per night for optimal health. Consistent, restful sleep is vital for physical and mental restoration.",
    content: "Good sleep improves concentration, mood, immune function, and overall well-being. Establish a regular sleep schedule, create a dark, quiet, and cool sleeping environment, and avoid caffeine or large meals close to bedtime. If you have persistent sleep problems, consult a doctor.",
    imageUrl: "/images/mock/sleep_quality.jpg",
    source: "National Sleep Foundation",
    tags: ["sleep hygiene", "insomnia", "rest", "well-being"]
  }
];

exports.getHealthContent = async (req, res) => {
  const { category, type, search } = req.query;
  let filteredContent = [...mockHealthContent];

  if (category) {
    filteredContent = filteredContent.filter(item =>
      item.category && item.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (type) {
    filteredContent = filteredContent.filter(item =>
      item.type && item.type.toLowerCase() === type.toLowerCase()
    );
  }
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredContent = filteredContent.filter(item =>
      (item.title && item.title.toLowerCase().includes(searchTerm)) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm)) ||
      (item.content && item.content.toLowerCase().includes(searchTerm)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  setTimeout(() => { // Simulate network delay
    res.status(200).json(filteredContent);
  }, 150 + Math.random() * 150);
};

exports.getHealthContentById = async (req, res) => {
    const { id } = req.params;
    const contentItem = mockHealthContent.find(item => item.id === id);
    setTimeout(() => { // Simulate network delay
        if (contentItem) {
            res.status(200).json(contentItem);
        } else {
            res.status(404).json({ message: "Health content item not found." });
        }
    }, 100);
};

// Note: The imageUrl paths are placeholders. In a real application,
// these images would need to be stored in `frontend/public/images/mock/` or served from a CDN.
// For this mock setup, the frontend will just display the path as text or try to fetch it.
// If these images are to be served from the backend, a static file serving middleware
// would be needed in `app.js` for an `/images` route.
// e.g., app.use('/images', express.static(path.join(__dirname, 'public/images'))); (if images are in backend's public folder)
// Or, frontend stores them in its `public` folder.
```
