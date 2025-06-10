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

    preferencesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentOffset = 0;
        await searchRecipes();
    });

    loadMoreBtn.addEventListener('click', async () => {
        currentOffset += recipesPerPage;
        await searchRecipes(true);
    });

    async function searchRecipes(append = false) {
        try {
            if (!append) {
                recipeResults.innerHTML = '';
                loadingSpinner.style.display = 'flex';
                resultsSection.style.display = 'block';
            }

            const formData = new FormData(preferencesForm);
            const searchParams = {
                query: formData.get('query'),
                diet: formData.get('diet'),
                cuisine: formData.get('cuisine'),
                maxReadyTime: formData.get('maxReadyTime'),
                intolerances: Array.from(formData.getAll('intolerances')).join(','),
                offset: currentOffset,
                number: recipesPerPage
            };

            const data = await searchRecipes(searchParams);
            totalResults = data.totalResults;
            displayRecipes(data.results, append);
            
            // Show/hide load more button based on remaining results
            const remainingResults = totalResults - (currentOffset + data.results.length);
            loadMoreBtn.style.display = remainingResults > 0 ? 'block' : 'none';
        } catch (error) {
            console.error('Error searching recipes:', error);
            recipeResults.innerHTML = '<p class="error-message">Sorry, there was an error fetching recipes. Please try again.</p>';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function displayRecipes(recipes, append) {
        if (!append) {
            recipeResults.innerHTML = '';
        }

        recipes.forEach((recipe, index) => {
            const recipeCard = createRecipeCard(recipe, index);
            recipeResults.appendChild(recipeCard);
            makeDraggable(recipeCard);
        });

        // Add drag and drop event listeners to the results container
        recipeResults.addEventListener('dragover', handleDragOver);
        recipeResults.addEventListener('drop', handleDrop);
    }

    function createRecipeCard(recipe, index) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.id = `recipe-${recipe.id}`;
        card.innerHTML = `
            <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                </div>
                <div class="recipe-tags">
                    ${recipe.diets ? recipe.diets.map(diet => `<span class="tag">${diet}</span>`).join('') : ''}
                </div>
                <div class="recipe-actions">
                    <button class="view-recipe-btn" data-id="${recipe.id}">View Recipe</button>
                    <button class="add-to-plan-btn" data-id="${recipe.id}">
                        <i class="fas fa-calendar-plus"></i> Add to Plan
                    </button>
                </div>
            </div>
        `;

        // View recipe button
        card.querySelector('.view-recipe-btn').addEventListener('click', async () => {
            try {
                const recipeDetails = await getRecipeDetails(recipe.id);
                sessionStorage.setItem('currentRecipe', JSON.stringify(recipeDetails));
                window.location.href = `/recipe.html?id=${recipe.id}`;
            } catch (error) {
                console.error('Error fetching recipe details:', error);
                alert('Sorry, there was an error loading the recipe details. Please try again.');
            }
        });

        // Add to plan button
        card.querySelector('.add-to-plan-btn').addEventListener('click', async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                await addToMealPlan(recipe.id, today, 'lunch');
                alert('Recipe added to your meal plan!');
            } catch (error) {
                console.error('Error adding recipe to meal plan:', error);
                alert('Sorry, there was an error adding the recipe to your meal plan. Please try again.');
            }
        });

        return card;
    }
}); 