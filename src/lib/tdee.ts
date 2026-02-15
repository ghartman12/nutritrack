export interface TDEEInput {
  weight: number;
  weightUnit: "lbs" | "kg";
  heightFeet?: number;
  heightInches?: number;
  heightCm?: number;
  age: number;
  sex: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "very_active";
  goal: "lose" | "maintain" | "gain";
  weeklyRate?: number; // lbs per week (0.5, 1, 1.5)
}

export interface TDEEResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

function lbsToKg(lbs: number): number {
  return lbs / 2.205;
}

function feetInchesToCm(feet: number, inches: number): number {
  return feet * 30.48 + inches * 2.54;
}

export function calculateTDEE(input: TDEEInput): TDEEResult {
  // Convert weight to kg
  const weightKg =
    input.weightUnit === "lbs" ? lbsToKg(input.weight) : input.weight;
  const weightLbs =
    input.weightUnit === "lbs" ? input.weight : input.weight * 2.205;

  // Convert height to cm
  let heightCm: number;
  if (input.weightUnit === "lbs" && input.heightFeet !== undefined) {
    heightCm = feetInchesToCm(input.heightFeet, input.heightInches ?? 0);
  } else {
    heightCm = input.heightCm ?? 170;
  }

  // Mifflin-St Jeor BMR
  let bmr: number;
  if (input.sex === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * input.age + 5;
  } else {
    // female and other use the female formula as a conservative default
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * input.age - 161;
  }

  // Apply activity multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel] ?? 1.55;
  let tdee = bmr * multiplier;

  // Apply goal adjustment
  if (input.goal !== "maintain" && input.weeklyRate) {
    // 1 lb of body weight ≈ 3500 calories
    const dailyAdjustment = (input.weeklyRate * 3500) / 7;
    if (input.goal === "lose") {
      tdee -= dailyAdjustment;
    } else {
      tdee += dailyAdjustment;
    }
  }

  const calories = Math.round(tdee);

  // Macro split
  // Protein: 1g per lb bodyweight, capped at 30% of calories
  let proteinCals = weightLbs * 4; // 1g/lb × 4 cal/g
  const maxProteinCals = calories * 0.3;
  if (proteinCals > maxProteinCals) {
    proteinCals = maxProteinCals;
  }
  const protein = Math.round(proteinCals / 4);

  // Fat: 25% of calories
  const fatCals = calories * 0.25;
  const fat = Math.round(fatCals / 9);

  // Carbs: remainder
  const carbCals = calories - proteinCals - fatCals;
  const carbs = Math.round(carbCals / 4);

  return { calories, protein, carbs, fat };
}
