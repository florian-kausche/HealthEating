// Sample meals data
const SAMPLE_MEALS = [
    // Breakfast options
    { 
        id: 1, 
        name: 'Waakye with Egg', 
        type: 'breakfast', 
        image: 'image/African-Cooking.png', 
        calories: 450,
        description: 'Traditional Ghanaian breakfast of rice and beans with egg'
    },
    { 
        id: 2, 
        name: 'Hausa Koko', 
        type: 'breakfast', 
        image: 'image/fruits-vegi.jpg', 
        calories: 300,
        description: 'Spiced millet porridge with koose'
    },
    // Lunch options
    { 
        id: 3, 
        name: 'Jollof Rice', 
        type: 'lunch', 
        image: 'image/salad.jpg', 
        calories: 550,
        description: 'Spiced rice cooked in tomato sauce with grilled chicken'
    },
    { 
        id: 4, 
        name: 'Banku and Tilapia', 
        type: 'lunch', 
        image: 'image/grilling-veggies.jpg', 
        calories: 600,
        description: 'Fermented corn dough with grilled tilapia and pepper sauce'
    },
    // Dinner options
    { 
        id: 5, 
        name: 'Fufu and Soup', 
        type: 'dinner', 
        image: 'image/African-Cooking.png', 
        calories: 500,
        description: 'Pounded cassava and plantain with light soup'
    },
    { 
        id: 6, 
        name: 'Ampesi', 
        type: 'dinner', 
        image: 'image/multivege.webp', 
        calories: 450,
        description: 'Boiled plantain and yam with garden egg stew'
    },
    // Snack options
    { 
        id: 7, 
        name: 'Kelewele', 
        type: 'snacks', 
        image: 'image/nutrition2.webp', 
        calories: 300,
        description: 'Spiced fried plantain cubes'
    },
    { 
        id: 8, 
        name: 'Meat Pie', 
        type: 'snacks', 
        image: 'image/mixedfruit.jpg', 
        calories: 250,
        description: 'African pastry filled with seasoned minced meat'
    }
];

class AISuggestions {
    async getPersonalizedPlan(preferences) {
        // Mock implementation of AI meal plan generation
        // In a real application, this would call an AI service or algorithm
        console.log('Generating AI meal plan with preferences:', preferences);
        
        // Return a sample meal plan
        return {
            Monday: [
                { title: 'Vegetable Stir Fry', readyInMinutes: 30, calories: 350 },
                { title: 'Chicken Salad', readyInMinutes: 15, calories: 250 }
            ],
            Tuesday: [
                { title: 'Spaghetti Aglio e Olio', readyInMinutes: 20, calories: 400 },
                { title: 'Caprese Salad', readyInMinutes: 10, calories: 200 }
            ],
            Wednesday: [
                { title: 'Beef Tacos', readyInMinutes: 25, calories: 450 },
                { title: 'Minestrone Soup', readyInMinutes: 35, calories: 300 }
            ],
            Thursday: [
                { title: 'Grilled Salmon', readyInMinutes: 20, calories: 500 },
                { title: 'Caesar Salad', readyInMinutes: 15, calories: 220 }
            ],
            Friday: [
                { title: 'Chicken Curry', readyInMinutes: 40, calories: 550 },
                { title: 'Pasta Primavera', readyInMinutes: 30, calories: 350 }
            ],
            Saturday: [
                { title: 'BBQ Ribs', readyInMinutes: 50, calories: 600 },
                { title: 'Coleslaw', readyInMinutes: 10, calories: 150 }
            ],
            Sunday: [
                { title: 'Roast Chicken', readyInMinutes: 90, calories: 700 },
                { title: 'Garden Salad', readyInMinutes: 10, calories: 180 }
            ]
        };
    }
}

class MealPlanner {
    constructor() {
        this.currentWeek = new Date();
        this.mealPlans = this.loadAllMealPlans() || {};
        this.mealPlan = this.loadCurrentWeekPlan() || this.createEmptyPlan();
        this.favorites = this.loadFavorites() || [];
        this.aiSuggestions = new AISuggestions();
        this.setupPlanner();
        this.setupAISuggestions();
        this.setupRecipeSearch();
    }

    setupPlanner() {
        this.renderWeekDays();
        this.updateWeekDisplay();
        this.renderMealSuggestions();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Week navigation
        document.getElementById('prev-week')?.addEventListener('click', () => {
            this.saveCurrentWeekPlan();
            this.changeWeek(-1);
        });
        document.getElementById('next-week')?.addEventListener('click', () => {
            this.saveCurrentWeekPlan();
            this.changeWeek(1);
        });

        // Planner actions
        document.getElementById('save-plan')?.addEventListener('click', () => this.savePlan());
        document.getElementById('clear-plan')?.addEventListener('click', () => this.clearPlan());
        document.getElementById('share-plan')?.addEventListener('click', () => this.sharePlan());
        document.getElementById('export-list')?.addEventListener('click', () => this.exportList());
        document.getElementById('email-list')?.addEventListener('click', () => this.emailList());
    }

    setupAISuggestions() {
        // Add AI suggestion button to planner controls
        const plannerControls = document.querySelector('.planner-controls');
        const aiButton = document.createElement('button');
        aiButton.className = 'ai-suggest-btn';
        aiButton.innerHTML = '<i class="fas fa-robot"></i> Get AI Suggestions';
        aiButton.onclick = () => this.showAIPreferencesModal();
        plannerControls.appendChild(aiButton);
    }

    async showAIPreferencesModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-preferences-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Customize Your AI Suggestions</h3>
                <form id="ai-preferences-form">
                    <div class="form-group">
                        <label for="diet">Dietary Preference:</label>
                        <select id="diet" name="diet">
                            <option value="">Any</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="gluten-free">Gluten-Free</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="calories">Daily Calories Target:</label>
                        <input type="number" id="calories" name="calories" value="2000">
                    </div>
                    <div class="form-group">
                        <label for="allergies">Allergies (comma-separated):</label>
                        <input type="text" id="allergies" name="allergies" placeholder="e.g., peanuts, shellfish">
                    </div>
                    <div class="form-group">
                        <label for="cuisine">Preferred Cuisine:</label>
                        <select id="cuisine" name="cuisine">
                            <option value="">Any</option>
                            <option value="african">African</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="asian">Asian</option>
                            <option value="european">European</option>
                        </select>
                    </div>
                    <button type="submit">Generate Plan</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('ai-preferences-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const preferences = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = e.target.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Generating...';

            // Get AI-generated meal plan
            const mealPlan = await this.aiSuggestions.getPersonalizedPlan(preferences);
            if (mealPlan) {
                this.populatePlannerWithAISuggestions(mealPlan);
                modal.remove();
            } else {
                alert('Failed to generate meal plan. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Generate Plan';
            }
        };
    }

    async populatePlannerWithAISuggestions(mealPlan) {
        // Clear existing plan
        this.clearPlan();
        
        // Populate each day with AI suggestions
        Object.entries(mealPlan).forEach(([day, meals]) => {
            const dayElement = document.querySelector(`[data-day="${day}"]`);
            if (dayElement) {
                meals.forEach(meal => {
                    const mealElement = document.createElement('div');
                    mealElement.className = 'meal-item ai-suggested';
                    mealElement.innerHTML = `
                        <h4>${meal.title}</h4>
                        <p>Ready in ${meal.readyInMinutes} minutes</p>
                        <p>Calories: ${meal.calories}</p>
                    `;
                    dayElement.appendChild(mealElement);
                });
            }
        });
    }

    renderWeekDays() {
        const grid = document.getElementById('planner-grid');
        if (!grid) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

        grid.innerHTML = days.map(day => `
            <div class="day-column">
                <div class="day-header">${day}</div>
                ${mealTypes.map(type => `
                    <div class="meal-cell" data-day="${day}" data-meal="${type}">
                        <div class="meal-cell-label">
                            <i class="fas ${this.getMealTypeIcon(type)}"></i>
                            ${type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        this.loadMealsIntoGrid();
    }

    getMealTypeIcon(type) {
        const icons = {
            breakfast: 'fa-coffee',
            lunch: 'fa-hamburger',
            dinner: 'fa-utensils',
            snacks: 'fa-apple-alt'
        };
        return icons[type] || 'fa-cutlery';
    }

    updateWeekDisplay() {
        const weekDisplay = document.getElementById('current-week');
        if (!weekDisplay) return;

        const start = this.getWeekDates(this.currentWeek)[0];
        const end = this.getWeekDates(this.currentWeek)[6];
        weekDisplay.textContent = `${this.formatDate(start)} - ${this.formatDate(end)}`;
    }

    formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getWeekDates(date) {
        const mondayDate = new Date(date);
        mondayDate.setDate(mondayDate.getDate() - mondayDate.getDay() + 1);
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(mondayDate);
            day.setDate(mondayDate.getDate() + i);
            return day;
        });
    }

    changeWeek(delta) {
        const newDate = new Date(this.currentWeek);
        newDate.setDate(newDate.getDate() + (delta * 7));
        this.currentWeek = newDate;
        this.mealPlan = this.loadCurrentWeekPlan() || this.createEmptyPlan();
        this.updateWeekDisplay();
        this.renderWeekDays();
    }

    loadMealsIntoGrid() {
        Object.entries(this.mealPlan).forEach(([day, meals]) => {
            Object.entries(meals).forEach(([mealType, meal]) => {
                if (meal) {
                    const cell = document.querySelector(`.meal-cell[data-day="${day}"][data-meal="${mealType}"]`);
                    if (cell) {
                        this.updateMealCell(cell, meal);
                    }
                }
            });
        });
    }

    updateMealCell(cell, meal) {
        cell.innerHTML = `
            <div class="planned-meal">
                <div class="meal-cell-content">
                    <img src="${meal.image}" alt="${meal.name}" class="meal-thumbnail">
                    <div class="meal-info">
                        <span class="meal-name">${meal.name}</span>
                        <span class="meal-calories">${meal.calories} cal</span>
                    </div>
                </div>
                <button class="remove-meal" onclick="mealPlanner.removeMeal('${cell.dataset.day}', '${cell.dataset.meal}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    removeMeal(day, mealType) {
        this.mealPlan[day][mealType] = null;
        this.saveCurrentWeekPlan();
        this.renderWeekDays();
    }

    renderMealSuggestions() {
        const suggestions = document.getElementById('meal-suggestions');
        if (!suggestions) return;

        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        const mealsByType = {};

        // Group meals by type
        SAMPLE_MEALS.forEach(meal => {
            if (!mealsByType[meal.type]) {
                mealsByType[meal.type] = [];
            }
            mealsByType[meal.type].push(meal);
        });

        // Create sections for each meal type
        suggestions.innerHTML = mealTypes.map(type => `
            <div class="meal-category">
                <h4 class="meal-type-header">
                    <i class="fas ${this.getMealTypeIcon(type)}"></i> 
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </h4>
                <div class="meal-cards" data-meal-type="${type}">
                    ${mealsByType[type]?.map(meal => this.createMealCard(meal)).join('') || ''}
                </div>
            </div>
        `).join('');

        this.initializeDragAndDrop();
    }

    createMealCard(meal) {
        const isFavorite = this.favorites.includes(meal.id);
        return `
            <div class="meal-card" 
                draggable="true" 
                data-meal-id="${meal.id}" 
                data-meal-type="${meal.type}">
                <div class="meal-card-image">
                    <img src="${meal.image}" alt="${meal.name}">
                    <div class="meal-info-overlay">
                        <h4>${meal.name}</h4>
                        <p>${meal.description}</p>
                        <span class="overlay-calories">${meal.calories} calories</span>
                        <span class="overlay-type">${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
                    </div>
                </div>
                <div class="meal-card-content">
                    <div class="meal-card-header">
                        <h5>${meal.name}</h5>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="mealPlanner.toggleFavorite(${meal.id}, event)">
                            <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart'}"></i>
                        </button>
                    </div>
                    <p class="meal-calories">${meal.calories} calories</p>
                    <p class="meal-description">${meal.description}</p>
                </div>
            </div>
        `;
    }

    initializeDragAndDrop() {
        // Add drag handlers to meal cards
        document.querySelectorAll('.meal-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('application/json', JSON.stringify({
                    mealId: card.dataset.mealId,
                    mealType: card.dataset.mealType
                }));
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        // Add drop handlers to meal cells
        document.querySelectorAll('.meal-cell').forEach(cell => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                cell.classList.add('drag-over');
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drag-over');
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');

                try {
                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    const meal = SAMPLE_MEALS.find(m => m.id.toString() === data.mealId);
                    
                    if (meal) {
                        const day = cell.dataset.day;
                        const mealType = cell.dataset.meal;
                        
                        if (!this.mealPlan[day]) {
                            this.mealPlan[day] = {};
                        }
                        
                        this.mealPlan[day][mealType] = meal;
                        this.updateMealCell(cell, meal);
                        this.saveCurrentWeekPlan();
                    }
                } catch (err) {
                    console.error('Error dropping meal:', err);
                }
            });
        });
    }

    toggleFavorite(mealId, event) {
        event.stopPropagation();
        const index = this.favorites.indexOf(mealId);
        
        if (index === -1) {
            this.favorites.push(mealId);
            this.showFeedback('Added to favorites!');
        } else {
            this.favorites.splice(index, 1);
            this.showFeedback('Removed from favorites');
        }
        
        this.saveFavorites();
        this.renderMealSuggestions(); // Re-render to update favorite buttons
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.classList.add('show'), 10);
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('mealFavorites')) || [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('mealFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    loadAllMealPlans() {
        try {
            return JSON.parse(localStorage.getItem('mealPlans')) || {};
        } catch (error) {
            console.error('Error loading meal plans:', error);
            return {};
        }
    }

    loadCurrentWeekPlan() {
        const weekKey = this.getWeekKey(this.currentWeek);
        return this.mealPlans[weekKey];
    }

    saveCurrentWeekPlan() {
        const weekKey = this.getWeekKey(this.currentWeek);
        this.mealPlans[weekKey] = this.mealPlan;
        this.saveMealPlans();
    }

    saveMealPlans() {
        try {
            localStorage.setItem('mealPlans', JSON.stringify(this.mealPlans));
        } catch (error) {
            console.error('Error saving meal plans:', error);
        }
    }

    createEmptyPlan() {
        const plan = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            plan[day] = {
                breakfast: null,
                lunch: null,
                dinner: null,
                snacks: null
            };
        });
        return plan;
    }

    setupRecipeSearch() {
        const searchForm = document.getElementById('recipe-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const searchInput = document.getElementById('recipe-search');
                const query = searchInput.value.trim();
                
                if (query) {
                    try {
                        const recipes = await searchRecipes({ query });
                        this.displayRecipeResults(recipes);
                    } catch (error) {
                        console.error('Error searching recipes:', error);
                        this.showFeedback('Failed to search recipes. Please try again.');
                    }
                }
            });
        }
    }

    displayRecipeResults(recipes) {
        const resultsContainer = document.getElementById('recipe-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';
        
        if (!recipes || recipes.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No recipes found. Try a different search term.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            resultsContainer.appendChild(recipeCard);
        });
    }

    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                    <span><i class="fas fa-fire"></i> ${recipe.calories || 'N/A'} cal</span>
                </p>
                <div class="recipe-actions">
                    <button class="view-recipe-btn" onclick="event.stopPropagation(); this.viewRecipeDetails(${recipe.id})">
                        <i class="fas fa-utensils"></i> View Recipe
                    </button>
                    <button class="add-to-plan-btn" onclick="event.stopPropagation(); this.addToPlan(${recipe.id})">
                        <i class="fas fa-plus"></i> Add to Plan
                    </button>
                </div>
            </div>
        `;

        // Add drag and drop functionality
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', recipe.id);
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        return card;
    }

    async viewRecipeDetails(recipeId) {
        try {
            const recipe = await getRecipeDetails(recipeId);
            // Show recipe details in a modal
            const modal = document.createElement('div');
            modal.className = 'modal-bg';
            modal.innerHTML = `
                <div class="modal-content recipe-detail-modal">
                    <span class="close-modal">&times;</span>
                    <h2>${recipe.title}</h2>
                    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-detail-image">
                    <div class="recipe-detail-info">
                        <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
                        <p><strong>Servings:</strong> ${recipe.servings}</p>
                        <h3>Ingredients:</h3>
                        <ul>
                            ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
                        </ul>
                        <h3>Instructions:</h3>
                        <ol>
                            ${recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || 'No instructions available'}
                        </ol>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Close modal functionality
            modal.querySelector('.close-modal').onclick = () => modal.remove();
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            this.showFeedback('Failed to load recipe details. Please try again.');
        }
    }

    async addToPlan(recipeId) {
        try {
            const recipe = await getRecipeDetails(recipeId);
            // Show meal type selection modal
            const modal = document.createElement('div');
            modal.className = 'modal-bg';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>Add to Meal Plan</h3>
                    <p>Select meal type and day:</p>
                    <form id="add-to-plan-form">
                        <div class="form-group">
                            <label for="meal-type">Meal Type:</label>
                            <select id="meal-type" required>
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snacks">Snacks</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="day">Day:</label>
                            <select id="day" required>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                        </div>
                        <button type="submit">Add to Plan</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // Handle form submission
            modal.querySelector('form').onsubmit = (e) => {
                e.preventDefault();
                const mealType = modal.querySelector('#meal-type').value;
                const day = modal.querySelector('#day').value;
                
                // Add recipe to plan
                const mealCell = document.querySelector(`[data-day="${day}"][data-meal-type="${mealType}"]`);
                if (mealCell) {
                    const mealElement = document.createElement('div');
                    mealElement.className = 'meal-item';
                    mealElement.innerHTML = `
                        <h4>${recipe.title}</h4>
                        <p>Ready in ${recipe.readyInMinutes} minutes</p>
                        <p>Calories: ${recipe.calories || 'N/A'}</p>
                    `;
                    mealCell.appendChild(mealElement);
                    this.showFeedback('Recipe added to meal plan!');
                }
                modal.remove();
            };

            // Close modal functionality
            modal.querySelector('.close-modal').onclick = () => modal.remove();
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error adding recipe to plan:', error);
            this.showFeedback('Failed to add recipe to plan. Please try again.');
        }
    }
}

// Initialize the meal planner
const mealPlanner = new MealPlanner();

// Make functions available globally for HTML event handlers
window.mealPlanner = mealPlanner;

// Add to window scope for button click handlers
window.addToPlan = function(recipeId, recipeName) {
    const modal = document.createElement('div');
    modal.className = 'add-to-plan-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add "${recipeName}" to Meal Plan</h3>
            <div class="meal-slot-picker">
                <select id="meal-day">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <select id="meal-time">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="add-btn">Add to Plan</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle adding the meal
    modal.querySelector('.add-btn').addEventListener('click', () => {
        const day = modal.querySelector('#meal-day').value;
        const mealTime = modal.querySelector('#meal-time').value;
        
        const mealData = {
            id: recipeId,
            name: recipeName,
            type: mealTime
        };

        // Find the cell and add the meal
        const cell = document.querySelector(`.meal-cell[data-day="${day}"][data-meal="${mealTime}"]`);
        if (cell) {
            mealPlanner.dropMeal({ 
                preventDefault: () => {},
                target: cell,
                dataTransfer: {
                    getData: () => JSON.stringify(mealData)
                }
            });
        }
        
        modal.remove();
    });

    // Handle cancel
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    // Handle clicking outside modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};
