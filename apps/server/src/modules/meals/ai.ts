import OpenAI from 'openai';
import { z } from 'zod';

export const MealItemSchema = z.object({
  name: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  ingredients: z.array(z.string()).default([]),
  recipe: z.string().default(''),
});

export const MealPlanSchema = z.object({
  planType: z.enum(['daily', 'weekly']),
  startDate: z.string(),
  endDate: z.string(),
  totalCalories: z.number().int().nonnegative().optional(),
  macros: z.object({ protein: z.number(), carbs: z.number(), fat: z.number() }),
  meals: z.array(MealItemSchema),
});

export type MealPlan = z.infer<typeof MealPlanSchema>;

const SYSTEM_PROMPT = 'You are a precise nutrition planner. Respond ONLY with strict JSON that matches the given schema. Do not include markdown.';

export async function generateMealPlan(params: {
  planType: 'daily' | 'weekly';
  targetCalories: number;
  dietType?: string | null;
  allergies?: string[] | null;
}): Promise<MealPlan> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Schema: type MealPlan = { planType: 'daily' | 'weekly'; startDate: string; endDate: string; totalCalories?: number; macros: { protein: number; carbs: number; fat: number }; meals: { name: string; mealType: 'breakfast'|'lunch'|'dinner'|'snack'; calories: number; protein: number; carbs: number; fat: number; ingredients: string[]; recipe: string; }[] } \nConstraints: targetCalories≈${params.targetCalories}, diet=${params.dietType || 'any'}, allergies=${(params.allergies || []).join(', ') || 'none'}. \nReturn ONLY valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content || '{}';
  const parsed = MealPlanSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error('Invalid AI response');
  }
  return parsed.data;
}

export function buildGroceryList(meals: MealPlan['meals']) {
  const map = new Map<string, number>();
  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      map.set(ing, (map.get(ing) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}
