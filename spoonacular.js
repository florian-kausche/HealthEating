// Spoonacular API key and base URL
const SPOONACULAR_API_KEY = 'd8c52d2dfd2a4f30bcb00f420d008ee4';
const SPOONACULAR_BASE_URL = 'https://spoonacular.com/';

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
