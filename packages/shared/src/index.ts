export type ApiResponse<T> = { data: T } | { error: string };

export interface MealPlanDay {
  day: string;
  meals: Array<{
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
  }>;
}

export interface MealPlan {
  days: MealPlanDay[];
}
