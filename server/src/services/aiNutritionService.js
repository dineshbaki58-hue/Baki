const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AINutritionService {
  async generateNutritionPlan(userProfile, preferences = {}) {
    try {
      const {
        age,
        gender,
        height,
        weight,
        activityLevel,
        fitnessGoal,
        dietaryRestrictions = [],
        foodPreferences = [],
        allergies = []
      } = userProfile;

      // Calculate BMR and TDEE
      const bmr = this.calculateBMR(age, gender, height, weight);
      const tdee = this.calculateTDEE(bmr, activityLevel);
      
      // Adjust calories based on fitness goal
      const targetCalories = this.adjustCaloriesForGoal(tdee, fitnessGoal);
      
      // Calculate macronutrient distribution
      const macros = this.calculateMacros(targetCalories, fitnessGoal);

      const prompt = this.buildNutritionPrompt({
        age,
        gender,
        height,
        weight,
        activityLevel,
        fitnessGoal,
        targetCalories,
        macros,
        dietaryRestrictions,
        foodPreferences,
        allergies
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and dietitian with expertise in creating personalized meal plans. Provide detailed, practical, and scientifically-backed nutrition advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      const nutritionPlan = this.parseNutritionResponse(response, targetCalories, macros);

      return {
        success: true,
        plan: nutritionPlan,
        metadata: {
          bmr,
          tdee,
          targetCalories,
          macros,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('AI Nutrition Service Error:', error);
      return {
        success: false,
        error: 'Failed to generate nutrition plan',
        fallback: this.generateFallbackPlan(userProfile)
      };
    }
  }

  calculateBMR(age, gender, height, weight) {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    return Math.round(bmr * activityMultipliers[activityLevel] || 1.2);
  }

  adjustCaloriesForGoal(tdee, fitnessGoal) {
    const adjustments = {
      weight_loss: tdee - 500, // 1 lb per week
      muscle_gain: tdee + 300, // 0.5 lb per week
      maintenance: tdee,
      performance: tdee + 200
    };
    
    return Math.max(adjustments[fitnessGoal] || tdee, 1200); // Minimum 1200 calories
  }

  calculateMacros(calories, fitnessGoal) {
    let protein, carbs, fat;
    
    switch (fitnessGoal) {
      case 'muscle_gain':
        protein = Math.round(calories * 0.25 / 4); // 25% protein
        carbs = Math.round(calories * 0.45 / 4);   // 45% carbs
        fat = Math.round(calories * 0.30 / 9);     // 30% fat
        break;
      case 'weight_loss':
        protein = Math.round(calories * 0.30 / 4); // 30% protein
        carbs = Math.round(calories * 0.35 / 4);   // 35% carbs
        fat = Math.round(calories * 0.35 / 9);     // 35% fat
        break;
      default:
        protein = Math.round(calories * 0.20 / 4); // 20% protein
        carbs = Math.round(calories * 0.50 / 4);   // 50% carbs
        fat = Math.round(calories * 0.30 / 9);     // 30% fat
    }
    
    return { protein, carbs, fat };
  }

  buildNutritionPrompt(profile) {
    return `
Create a personalized 7-day nutrition plan for the following profile:

**Personal Information:**
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Activity Level: ${profile.activityLevel}
- Fitness Goal: ${profile.fitnessGoal}

**Nutritional Targets:**
- Daily Calories: ${profile.targetCalories}
- Protein: ${profile.macros.protein}g
- Carbohydrates: ${profile.macros.carbs}g
- Fat: ${profile.macros.fat}g

**Dietary Considerations:**
- Restrictions: ${profile.dietaryRestrictions.join(', ') || 'None'}
- Preferences: ${profile.foodPreferences.join(', ') || 'None'}
- Allergies: ${profile.allergies.join(', ') || 'None'}

Please provide:
1. A 7-day meal plan with breakfast, lunch, dinner, and 2 snacks
2. Specific portion sizes and cooking instructions
3. Nutritional breakdown for each meal
4. Shopping list for the week
5. Meal prep tips
6. Hydration recommendations

Format the response as a structured JSON object with the following structure:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": { "name": "...", "ingredients": [...], "instructions": "...", "nutrition": {...} },
        "lunch": { "name": "...", "ingredients": [...], "instructions": "...", "nutrition": {...} },
        "dinner": { "name": "...", "ingredients": [...], "instructions": "...", "nutrition": {...} },
        "snacks": [
          { "name": "...", "ingredients": [...], "instructions": "...", "nutrition": {...} }
        ]
      }
    }
  ],
  "shoppingList": [...],
  "mealPrepTips": [...],
  "hydrationRecommendations": "..."
}
    `;
  }

  parseNutritionResponse(response, targetCalories, macros) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to text parsing
      return {
        weeklyPlan: this.parseTextToMealPlan(response),
        shoppingList: this.extractShoppingList(response),
        mealPrepTips: this.extractMealPrepTips(response),
        hydrationRecommendations: this.extractHydrationTips(response),
        targetCalories,
        macros
      };
    } catch (error) {
      console.error('Error parsing nutrition response:', error);
      return this.generateFallbackPlan({ targetCalories, macros });
    }
  }

  generateFallbackPlan(userProfile) {
    const { targetCalories, macros } = userProfile;
    
    return {
      weeklyPlan: [
        {
          day: "Sample Day",
          meals: {
            breakfast: {
              name: "Balanced Breakfast",
              ingredients: ["Oatmeal", "Banana", "Almonds", "Greek Yogurt"],
              instructions: "Mix oatmeal with yogurt, top with banana and almonds",
              nutrition: { calories: Math.round(targetCalories * 0.25), protein: Math.round(macros.protein * 0.25) }
            },
            lunch: {
              name: "Protein-Rich Lunch",
              ingredients: ["Grilled Chicken", "Quinoa", "Mixed Vegetables"],
              instructions: "Grill chicken, cook quinoa, steam vegetables",
              nutrition: { calories: Math.round(targetCalories * 0.35), protein: Math.round(macros.protein * 0.35) }
            },
            dinner: {
              name: "Light Dinner",
              ingredients: ["Salmon", "Sweet Potato", "Broccoli"],
              instructions: "Bake salmon and sweet potato, steam broccoli",
              nutrition: { calories: Math.round(targetCalories * 0.30), protein: Math.round(macros.protein * 0.30) }
            },
            snacks: [
              {
                name: "Healthy Snack",
                ingredients: ["Apple", "Peanut Butter"],
                instructions: "Slice apple and serve with peanut butter",
                nutrition: { calories: Math.round(targetCalories * 0.10), protein: Math.round(macros.protein * 0.10) }
              }
            ]
          }
        }
      ],
      shoppingList: ["Oatmeal", "Banana", "Almonds", "Greek Yogurt", "Chicken", "Quinoa", "Vegetables", "Salmon", "Sweet Potato", "Broccoli", "Apple", "Peanut Butter"],
      mealPrepTips: ["Prep proteins in advance", "Wash and cut vegetables", "Cook grains in batches"],
      hydrationRecommendations: "Drink 8-10 glasses of water daily, more during workouts"
    };
  }

  parseTextToMealPlan(text) {
    // Simple text parsing fallback
    return [{
      day: "Generated Plan",
      meals: {
        breakfast: { name: "AI Generated Breakfast", ingredients: [], instructions: "", nutrition: {} },
        lunch: { name: "AI Generated Lunch", ingredients: [], instructions: "", nutrition: {} },
        dinner: { name: "AI Generated Dinner", ingredients: [], instructions: "", nutrition: {} },
        snacks: [{ name: "AI Generated Snack", ingredients: [], instructions: "", nutrition: {} }]
      }
    }];
  }

  extractShoppingList(text) {
    // Extract shopping list from text
    return ["Generated shopping list items"];
  }

  extractMealPrepTips(text) {
    // Extract meal prep tips from text
    return ["Generated meal prep tips"];
  }

  extractHydrationTips(text) {
    // Extract hydration recommendations from text
    return "Generated hydration recommendations";
  }
}

module.exports = new AINutritionService();