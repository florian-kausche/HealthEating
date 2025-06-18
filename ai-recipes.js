import { searchRecipes, getRecipeDetails, addToMealPlan } from './spoonacular.js';

document.addEventListener('DOMContentLoaded', () => {
    const preferencesForm = document.getElementById('ai-preferences-form');
    const resultsSection = document.querySelector('.results-section');
    const recipeResults = document.getElementById('recipe-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const loadMoreBtn = document.getElementById('load-more');
    
    let currentOffset = 0;
    const recipesPerPage = 10;
    let totalResults = 0;
    let draggedItem = null;
    let currentQuery = '';
    let isLoading = false;

    // Make recipe cards draggable
    function makeDraggable(element) {
        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.id);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        if (draggedItem) {
            const dropTarget = e.target.closest('.recipe-card');
            if (dropTarget && dropTarget !== draggedItem) {
                const allCards = [...recipeResults.getElementsByClassName('recipe-card')];
                const draggedIndex = allCards.indexOf(draggedItem);
                const dropIndex = allCards.indexOf(dropTarget);

                if (draggedIndex < dropIndex) {
                    dropTarget.parentNode.insertBefore(draggedItem, dropTarget.nextSibling);
                } else {
                    dropTarget.parentNode.insertBefore(draggedItem, dropTarget);
                }
            }
        }
    }

    /**
     * Handles the form submission for recipe suggestions
     * @param {Event} event - The form submission event
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        // Reset state
        currentOffset = 0;
        recipeResults.innerHTML = '';
        
        // Get form data
        const formData = new FormData(preferencesForm);
        currentQuery = formData.get('query');
        
        // Show loading state
        showLoading(true);
        resultsSection.style.display = 'block';
        
        try {
            // Fetch recipes from Spoonacular API
            const recipes = await searchRecipes({
                query: currentQuery,
                diet: formData.get('diet'),
                cuisine: formData.get('cuisine'),
                maxReadyTime: formData.get('maxReadyTime'),
                intolerances: formData.getAll('intolerances'),
                offset: currentOffset
            });
            
            // Display results
            displayRecipes(recipes);
            
            // Show/hide load more button based on results
            loadMoreBtn.style.display = recipes.length === 10 ? 'block' : 'none';
        } catch (error) {
            console.error('Error fetching recipes:', error);
            showError('Failed to fetch recipes. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    /**
     * Displays recipe cards in the results grid
     * @param {Array} recipes - Array of recipe objects from the API
     */
    function displayRecipes(recipes) {
        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            recipeResults.appendChild(recipeCard);
        });
    }

    /**
     * Creates a recipe card element
     * @param {Object} recipe - Recipe data from the API
     * @returns {HTMLElement} The recipe card element
     */
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                </div>
                <p class="recipe-summary">${recipe.summary}</p>
                <div class="recipe-tags">
                    ${recipe.diets.map(diet => `<span class="tag">${diet}</span>`).join('')}
                </div>
                <a href="${recipe.sourceUrl}" target="_blank" class="view-recipe-btn">View Recipe</a>
            </div>
        `;
        
        return card;
    }

    /**
     * Handles loading more recipes when the "Load More" button is clicked
     */
    async function handleLoadMore() {
        if (isLoading) return;
        
        isLoading = true;
        currentOffset += 10;
        showLoading(true);
        
        try {
            const recipes = await searchRecipes({
                query: currentQuery,
                offset: currentOffset
            });
            
            displayRecipes(recipes);
            loadMoreBtn.style.display = recipes.length === 10 ? 'block' : 'none';
        } catch (error) {
            console.error('Error loading more recipes:', error);
            showError('Failed to load more recipes. Please try again.');
        } finally {
            isLoading = false;
            showLoading(false);
        }
    }

    /**
     * Shows or hides the loading spinner
     * @param {boolean} show - Whether to show or hide the spinner
     */
    function showLoading(show) {
        loadingSpinner.style.display = show ? 'flex' : 'none';
    }

    /**
     * Shows an error message to the user
     * @param {string} message - The error message to display
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        resultsSection.insertBefore(errorDiv, recipeResults);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Event Listeners
    preferencesForm.addEventListener('submit', handleFormSubmit);
    loadMoreBtn.addEventListener('click', handleLoadMore);

    // Initialize the page
    document.addEventListener('DOMContentLoaded', () => {
        // Add any initialization code here
    });
}); 