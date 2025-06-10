class AISuggestions {    constructor() {
        this.apiKey = 'd8c52d2dfd2a4f30bcb00f420d008ee4';
        this.baseUrl = 'https://api.spoonacular.com';
        
        if (!this.apiKey) {
            console.error('Spoonacular API key not set. Please sign up at https://spoonacular.com/food-api and add your API key.');
            alert('API key not configured. Please contact the administrator.');
        }
    }

    async getSuggestedMeals(preferences) {
        if (this.apiKey === 'YOUR_SPOONACULAR_API_KEY') {
            throw new Error('API key not configured');
        }

        try {
            const params = new URLSearchParams({
                apiKey: this.apiKey,
                number: preferences.number || 10,
                offset: preferences.offset || 0,
                query: preferences.query || '',
                diet: preferences.diet || '',
                intolerances: preferences.intolerances || '',
                cuisine: preferences.cuisine || '',
                maxReadyTime: preferences.maxReadyTime || '',
                instructionsRequired: 'true',
                fillIngredients: 'true',
                addRecipeInformation: 'true'
            });

            const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching AI suggestions:', error);
            return [];
        }
    }

    async getPersonalizedPlan(userPreferences) {
        try {
            const params = new URLSearchParams({
                apiKey: this.apiKey,
                timeFrame: 'week',
                diet: userPreferences.diet || '',
                targetCalories: userPreferences.calories || 2000,
                exclude: userPreferences.allergies || ''
            });

            const response = await fetch(`https://api.spoonacular.com/mealplanner/generate?${params}`);
            const data = await response.json();
            return data.week;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            return null;
        }
    }

    async getNutritionalAnalysis(ingredients) {
        try {
            const response = await fetch('https://api.spoonacular.com/recipes/analyzeNutrition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({ ingredients })
            });
            return await response.json();
        } catch (error) {
            console.error('Error analyzing nutrition:', error);
            return null;
        }
    }

    async getRecipeDetails(recipeId) {
        try {
            const params = new URLSearchParams({
                apiKey: this.apiKey
            });

            const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/information?${params}`);
            const data = await response.json();
            
            // Get nutritional information
            const nutritionResponse = await fetch(
                `${this.baseUrl}/recipes/${recipeId}/nutritionWidget.json?${params}`
            );
            const nutritionData = await nutritionResponse.json();
            
            return {
                ...data,
                nutrition: nutritionData
            };
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            throw error;
        }
    }

    getUserRatings() {
        return JSON.parse(localStorage.getItem('recipeRatings') || '{}');
    }

    async getRecipeReviews(recipeId) {
        try {
            const params = new URLSearchParams({
                apiKey: this.apiKey
            });

            const response = await fetch(`${this.baseUrl}/recipes/${recipeId}/reviews?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching recipe reviews:', error);
            return [];
        }
    }

    async submitReview(recipeId, review) {
        const reviews = JSON.parse(localStorage.getItem('recipeReviews') || '{}');
        if (!reviews[recipeId]) {
            reviews[recipeId] = [];
        }
        
        const newReview = {
            id: Date.now(),
            date: new Date().toISOString(),
            rating: review.rating,
            text: review.text,
            username: review.username || 'Anonymous'
        };
        
        reviews[recipeId].unshift(newReview);
        localStorage.setItem('recipeReviews', JSON.stringify(reviews));
        return newReview;
    }
}
