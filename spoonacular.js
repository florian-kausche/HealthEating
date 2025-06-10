// Spoonacular API key and base URL
const SPOONACULAR_API_KEY = 'd8c52d2dfd2a4f30bcb00f420d008ee4';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/';

const searchForm = document.getElementById('recipe-search-form');
const searchInput = document.getElementById('recipe-search-input');
const dietFilter = document.getElementById('diet-filter');
const mealTypeFilter = document.getElementById('meal-type-filter');
const resultsDiv = document.getElementById('recipes-results');
const statusDiv = document.getElementById('search-status');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadingSpinner = document.getElementById('loading-spinner');

let lastQuery = '';
let lastDiet = '';
let lastMealType = '';
let offset = 0;
const pageSize = 8;

function buildApiUrl(query, diet, mealType, offset) {
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=${pageSize}&offset=${offset}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (diet) url += `&diet=${encodeURIComponent(diet)}`;
    if (mealType) url += `&type=${encodeURIComponent(mealType)}`;
    url += '&addRecipeInformation=true';
    return url;
}

async function fetchRecipes(query, diet, mealType, offset) {
    statusDiv.textContent = '';
    loadingSpinner.style.display = 'block';
    try {
        const url = buildApiUrl(query, diet, mealType, offset);
        const res = await fetch(url);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        return data;
    } catch (e) {
        statusDiv.textContent = 'Error fetching recipes. Please try again.';
        return null;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function renderRecipes(recipes, append = false) {
    if (!append) resultsDiv.innerHTML = '';
    if (!recipes || recipes.length === 0) {
        if (!append) resultsDiv.innerHTML = '<p>No recipes found.</p>';
        return;
    }
    for (const recipe of recipes) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">
            <h4>${recipe.title}</h4>
            <p>${recipe.summary ? recipe.summary.replace(/<[^>]+>/g, '').slice(0, 120) + '...' : ''}</p>
            <a href="${recipe.sourceUrl}" target="_blank" class="view-btn">View Recipe</a>
        `;
        resultsDiv.appendChild(card);
    }
}

async function handleSearch(e, isLoadMore = false) {
    if (e) e.preventDefault();
    if (!isLoadMore) {
        offset = 0;
        resultsDiv.innerHTML = '';
    }
    const query = searchInput.value.trim();
    const diet = dietFilter.value;
    const mealType = mealTypeFilter.value;
    lastQuery = query;
    lastDiet = diet;
    lastMealType = mealType;
    const data = await fetchRecipes(query, diet, mealType, offset);
    if (data && data.results) {
        renderRecipes(data.results, isLoadMore);
        // Show load more if there are more results
        if (data.totalResults > offset + pageSize) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

searchForm.addEventListener('submit', handleSearch);

loadMoreBtn.addEventListener('click', async () => {
    offset += pageSize;
    await handleSearch(null, true);
});

// Optional: trigger search on filter change
dietFilter.addEventListener('change', handleSearch);
mealTypeFilter.addEventListener('change', handleSearch);

/**
 * Searches for recipes based on various parameters
 */
export async function searchRecipes(params) {
    const { query, diet, cuisine, maxReadyTime, intolerances, offset = 0, number = 10 } = params;
    
    const url = new URL(`${SPOONACULAR_BASE_URL}recipes/complexSearch`);
    url.searchParams.append('apiKey', SPOONACULAR_API_KEY);
    url.searchParams.append('query', query);
    url.searchParams.append('number', number);
    url.searchParams.append('offset', offset);
    url.searchParams.append('addRecipeInformation', true);
    url.searchParams.append('fillIngredients', true);
    url.searchParams.append('addRecipeNutrition', true);

    if (diet) url.searchParams.append('diet', diet);
    if (cuisine) url.searchParams.append('cuisine', cuisine);
    if (maxReadyTime) url.searchParams.append('maxReadyTime', maxReadyTime);
    if (intolerances) url.searchParams.append('intolerances', intolerances);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}

/**
 * Gets detailed information about a specific recipe
 */
export async function getRecipeDetails(recipeId) {
    const url = `${SPOONACULAR_BASE_URL}recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        throw error;
    }
}

/**
 * Generates a meal plan
 */
export async function generateMealPlan(params) {
    const { timeFrame, targetCalories, diet, exclude } = params;
    
    const url = new URL(`${SPOONACULAR_BASE_URL}mealplanner/generate`);
    url.searchParams.append('apiKey', SPOONACULAR_API_KEY);
    url.searchParams.append('timeFrame', timeFrame);
    
    if (targetCalories) url.searchParams.append('targetCalories', targetCalories);
    if (diet) url.searchParams.append('diet', diet);
    if (exclude) url.searchParams.append('exclude', exclude);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}

/**
 * Adds a recipe to the meal plan
 */
export async function addToMealPlan(recipeId, date, mealType) {
    const url = `${SPOONACULAR_BASE_URL}mealplanner/add`;
    const data = {
        date: date,
        slot: mealType,
        position: 0,
        type: 'RECIPE',
        value: {
            id: recipeId,
            servings: 1
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': SPOONACULAR_API_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding recipe to meal plan:', error);
        throw error;
    }
}

/**
 * Gets the meal plan for a specific date range
 */
export async function getMealPlan(startDate, endDate) {
    const url = `${SPOONACULAR_BASE_URL}mealplanner/${startDate}/${endDate}?apiKey=${SPOONACULAR_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching meal plan:', error);
        throw error;
    }
}
