class RecipeSearch {
    constructor() {
        this.form = document.getElementById('recipe-search-form');
        this.input = document.getElementById('recipe-search-input');
        this.resultsContainer = document.getElementById('recipes-results');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.searchStatus = document.getElementById('search-status');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.dietFilter = document.getElementById('diet-filter');
        this.mealTypeFilter = document.getElementById('meal-type-filter');
        
        this.currentOffset = 0;
        this.currentQuery = '';
        this.isSearching = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form?.addEventListener('submit', (e) => this.handleSearch(e));
        this.loadMoreBtn?.addEventListener('click', () => this.loadMore());
        this.dietFilter?.addEventListener('change', () => this.handleFiltersChange());
        this.mealTypeFilter?.addEventListener('change', () => this.handleFiltersChange());
    }

    async handleSearch(e) {
        e.preventDefault();
        if (this.isSearching) return;

        const query = this.input.value.trim();
        if (!query) return;

        this.currentQuery = query;
        this.currentOffset = 0;
        this.showLoading('Searching recipes...');
        this.resultsContainer.innerHTML = '';
        
        try {
            const results = await this.searchRecipes();
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to search recipes. Please try again.');
        }
    }

    async handleFiltersChange() {
        if (!this.currentQuery) return;
        this.currentOffset = 0;
        this.showLoading('Updating results...');
        
        try {
            const results = await this.searchRecipes();
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to update results. Please try again.');
        }
    }

    async searchRecipes() {
        this.isSearching = true;
        try {
            const diet = this.dietFilter.value;
            const mealType = this.mealTypeFilter.value;
            
            const params = new URLSearchParams({
                query: this.currentQuery,
                offset: this.currentOffset,
                number: 30,
                diet: diet,
                type: mealType,
                addRecipeInformation: true,
                fillIngredients: true
            });

            const response = await fetch(
                `https://api.spoonacular.com/recipes/complexSearch?${params}&apiKey=YOUR_API_KEY`
            );
            
            if (!response.ok) throw new Error('Failed to fetch recipes');
            return await response.json();
        } finally {
            this.isSearching = false;
        }
    }

    displayResults(data) {
        this.hideLoading();
        
        if (!data.results || data.results.length === 0) {
            this.showError('No recipes found. Try different keywords or filters.');
            this.loadMoreBtn.style.display = 'none';
            return;
        }

        this.showStatus(`Found ${data.totalResults} recipes`);
        this.resultsContainer.innerHTML = '';
        this.appendRecipes(data.results);
        
        this.loadMoreBtn.style.display = 
            data.totalResults > this.currentOffset + data.results.length ? 'block' : 'none';
    }

    appendRecipes(recipes) {
        recipes.forEach(recipe => {
            const card = document.createElement('article');
            card.className = 'recipe-card';
            card.setAttribute('draggable', 'true');
            card.dataset.recipeId = recipe.id;
            card.dataset.mealType = recipe.dishTypes?.[0] || 'main course';
            
            card.innerHTML = `
                <div class="recipe-card-image">
                    <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
                    <span class="recipe-time">
                        <i class="fas fa-clock"></i> ${recipe.readyInMinutes} min
                    </span>
                </div>
                <div class="recipe-card-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-rating">
                            <i class="fas fa-star"></i> ${recipe.spoonacularScore ? 
                            (recipe.spoonacularScore / 20).toFixed(1) : '4.0'}
                        </span>
                        <span class="recipe-servings">
                            <i class="fas fa-users"></i> ${recipe.servings} servings
                        </span>
                    </div>
                    <div class="recipe-tags">
                        ${this.generateRecipeTags(recipe)}
                    </div>
                    <div class="recipe-actions">
                        <button onclick="showRecipeDetails(${recipe.id})" class="view-recipe-btn">
                            View Recipe
                        </button>
                        <button class="add-to-plan-btn" onclick="addToPlan(${recipe.id}, '${recipe.title}')">
                            <i class="fas fa-calendar-plus"></i> Add to Plan
                        </button>
                    </div>
                </div>
            `;
            
            // Add drag event listeners
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    id: recipe.id,
                    name: recipe.title,
                    type: recipe.dishTypes?.[0] || 'main course',
                    image: recipe.image
                }));
                card.classList.add('dragging');
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
            
            this.resultsContainer.appendChild(card);
        });
    }

    generateRecipeTags(recipe) {
        const tags = [];
        if (recipe.vegetarian) tags.push('Vegetarian');
        if (recipe.vegan) tags.push('Vegan');
        if (recipe.glutenFree) tags.push('Gluten-Free');
        if (recipe.dairyFree) tags.push('Dairy-Free');
        
        return tags
            .slice(0, 3)
            .map(tag => `<span class="recipe-tag">${tag}</span>`)
            .join('');
    }

    async loadMore() {
        if (this.isSearching) return;
        
        this.currentOffset += 12;
        this.loadMoreBtn.disabled = true;
        this.showLoadingSpinner();
        
        try {
            const results = await this.searchRecipes();
            this.appendRecipes(results.results);
            this.loadMoreBtn.disabled = false;
            this.loadMoreBtn.style.display = 
                results.totalResults > this.currentOffset + results.results.length ? 'block' : 'none';
        } catch (error) {
            this.showError('Failed to load more recipes. Please try again.');
            this.currentOffset -= 12;
        } finally {
            this.hideLoadingSpinner();
        }
    }

    showLoading(message) {
        this.searchStatus.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        this.searchStatus.style.display = 'block';
    }

    hideLoading() {
        this.searchStatus.style.display = 'none';
    }

    showLoadingSpinner() {
        this.loadingSpinner.style.display = 'block';
    }

    hideLoadingSpinner() {
        this.loadingSpinner.style.display = 'none';
    }

    showError(message) {
        this.searchStatus.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
        this.searchStatus.style.display = 'block';
    }

    showStatus(message) {
        this.searchStatus.innerHTML = `
            <div class="status-message">
                <p>${message}</p>
            </div>
        `;
        this.searchStatus.style.display = 'block';
    }
}

// Initialize recipe search
document.addEventListener('DOMContentLoaded', () => {
    new RecipeSearch();
});