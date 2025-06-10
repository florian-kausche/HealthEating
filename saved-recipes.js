document.addEventListener('DOMContentLoaded', () => {
    const aiSuggestions = new AISuggestions();
    const container = document.getElementById('saved-recipes-container');
    const noSavedSection = document.getElementById('no-saved-recipes');
    const searchInput = document.getElementById('search-saved');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    let savedRecipes = [];
    let filteredRecipes = [];

    async function loadSavedRecipes() {
        const savedIds = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        
        if (savedIds.length === 0) {
            container.style.display = 'none';
            noSavedSection.style.display = 'flex';
            return;
        }

        container.style.display = 'grid';
        noSavedSection.style.display = 'none';
        
        try {
            savedRecipes = await Promise.all(
                savedIds.map(id => aiSuggestions.getRecipeDetails(id))
            );
            filteredRecipes = [...savedRecipes];
            renderRecipes();
        } catch (error) {
            console.error('Error loading saved recipes:', error);
        }
    }

    function renderRecipes() {
        container.innerHTML = filteredRecipes.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-actions">
                    <button class="action-btn remove-btn" title="Remove from saved">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn share-btn" title="Share recipe">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="action-btn print-btn" title="Print recipe">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                        <span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
                    </div>
                    <div class="recipe-rating" data-recipe-id="${recipe.id}">
                        ${renderRating(recipe.rating || 0)}
                        <span class="rating-count">(${recipe.ratingCount || 0})</span>
                    </div>
                </div>
            </div>
        `).join('');

        setupCardInteractions();
    }

    function renderRating(rating) {
        return Array.from({ length: 5 }, (_, i) => `
            <i class="fa${i < rating ? 's' : 'r'} fa-star" data-rating="${i + 1}"></i>
        `).join('');
    }

    function setupCardInteractions() {
        // Recipe card click
        container.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.recipe-actions')) {
                    showRecipeDetails(card.dataset.id);
                }
            });
        });

        // Remove button
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.recipe-card');
                removeRecipe(card.dataset.id);
            });
        });

        // Share button
        container.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.recipe-card');
                shareRecipe(card.dataset.id);
            });
        });

        // Print button
        container.querySelectorAll('.print-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.recipe-card');
                printRecipe(card.dataset.id);
            });
        });

        // Rating stars
        container.querySelectorAll('.recipe-rating').forEach(ratingContainer => {
            const stars = ratingContainer.querySelectorAll('.fa-star');
            stars.forEach(star => {
                star.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rating = parseInt(star.dataset.rating);
                    const recipeId = ratingContainer.dataset.recipeId;
                    submitRating(recipeId, rating);
                });
            });
        });
    }

    async function removeRecipe(recipeId) {
        const savedIds = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        const index = savedIds.indexOf(recipeId);
        if (index > -1) {
            savedIds.splice(index, 1);
            localStorage.setItem('savedRecipes', JSON.stringify(savedIds));
            await loadSavedRecipes();
        }
    }

    async function shareRecipe(recipeId) {
        const recipe = savedRecipes.find(r => r.id === parseInt(recipeId));
        if (recipe) {
            const shareData = {
                title: recipe.title,
                text: `Check out this amazing recipe for ${recipe.title}!`,
                url: window.location.origin + '/recipe/' + recipe.id
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback to clipboard copy
                    const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Recipe link copied to clipboard!');
                }
            } catch (error) {
                console.error('Error sharing recipe:', error);
            }
        }
    }

    async function printRecipe(recipeId) {
        const recipe = savedRecipes.find(r => r.id === parseInt(recipeId));
        if (recipe) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${recipe.title} - Recipe</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #2d3748; }
                        .recipe-image { max-width: 400px; display: block; margin: 20px 0; }
                        .ingredients { margin: 20px 0; }
                        .instructions { margin: 20px 0; }
                        .meta { color: #4a5568; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>${recipe.title}</h1>
                    <div class="meta">
                        <p>Preparation time: ${recipe.readyInMinutes} minutes</p>
                        <p>Servings: ${recipe.servings}</p>
                    </div>
                    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                    <div class="ingredients">
                        <h2>Ingredients</h2>
                        <ul>
                            ${recipe.extendedIngredients.map(ing => 
                                `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="instructions">
                        <h2>Instructions</h2>
                        <ol>
                            ${recipe.analyzedInstructions[0]?.steps.map(step => 
                                `<li>${step.step}</li>`
                            ).join('') || '<li>No instructions available</li>'}
                        </ol>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    async function submitRating(recipeId, rating) {
        const savedRatings = JSON.parse(localStorage.getItem('recipeRatings') || '{}');
        savedRatings[recipeId] = rating;
        localStorage.setItem('recipeRatings', JSON.stringify(savedRatings));
        
        const recipe = savedRecipes.find(r => r.id === parseInt(recipeId));
        if (recipe) {
            recipe.rating = rating;
            recipe.ratingCount = (recipe.ratingCount || 0) + 1;
            renderRecipes();
        }
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredRecipes = savedRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm)
        );
        renderRecipes();
    });

    // View toggle functionality
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            container.className = 'saved-recipes-' + btn.dataset.view;
        });
    });

    // Initial load
    loadSavedRecipes();
});
