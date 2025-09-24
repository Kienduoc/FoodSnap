
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        timestamp: { type: Type.STRING, description: "ISO 8601 timestamp of the analysis." },
        request_id: { type: Type.STRING, description: "Unique request ID (UUID)." },
        user_id: { type: Type.STRING },
        image_id: { type: Type.STRING, description: "Unique image ID (UUID)." },
        image_meta: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.INTEGER },
                height: { type: Type.INTEGER },
                device: { type: Type.STRING, description: "e.g., 'Pixel 7' or 'Unknown'" },
                use_reference_card: { type: Type.BOOLEAN },
            }
        },
        detections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Detection ID, e.g., 'd1'." },
                    bbox: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "[x_min, y_min, x_max, y_max]" },
                    mask_rle: { type: Type.STRING, nullable: true, description: "Run-length encoded mask string or null." },
                    label: { type: Type.STRING, description: "Internal label, e.g., 'pho_bo'." },
                    label_display: { type: Type.STRING, description: "Display name, e.g., 'Phở bò'." },
                    confidence: { type: Type.NUMBER, description: "Detection confidence score (0-1)." },
                    top5: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                display: { type: Type.STRING },
                                confidence: { type: Type.NUMBER },
                            }
                        }
                    },
                    segmentation_area_px: { type: Type.INTEGER },
                    estimated_grams: { type: Type.NUMBER },
                    grams_confidence: { type: Type.NUMBER, description: "Confidence in gram estimation (0-1)." },
                    kcal_per_100g: { type: Type.INTEGER },
                    estimated_kcal: { type: Type.INTEGER },
                }
            }
        },
        meal_total_kcal: { type: Type.INTEGER },
        user_profile_snapshot: {
            type: Type.OBJECT,
            properties: {
                user_id: { type: Type.STRING },
                sex: { type: Type.STRING, enum: ['male', 'female', 'other'] },
                age: { type: Type.INTEGER },
                height_cm: { type: Type.NUMBER },
                weight_kg: { type: Type.NUMBER },
                activity_level: { type: Type.STRING, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
                goal: { type: Type.STRING, enum: ['maintain', 'lose', 'gain'] },
            }
        },
        user_tdee: { type: Type.INTEGER, description: "Total Daily Energy Expenditure." },
        meal_target_kcal: { type: Type.INTEGER, description: "Estimated target calories for this meal." },
        suitability: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, enum: ['suitable', 'slightly_high', 'high', 'very_high', 'low'] },
                score: { type: Type.NUMBER, description: "Suitability score (optional)." },
                message: { type: Type.STRING, description: "Explanatory message for the user." },
            }
        },
        corrections_allowed: { type: Type.BOOLEAN },
    }
};

export const analyzeMeal = async (imageFile: File, userProfile: UserProfile): Promise<AnalysisResult> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `
Analyze the attached image of a meal. My user profile is:
${JSON.stringify(userProfile, null, 2)}

Your tasks are:
1.  Detect and segment each food item in the image.
2.  For each item, classify the dish and provide top-5 predictions.
3.  Estimate the portion size in grams. Be realistic.
4.  Look up the typical calories (kcal) per 100g for each dish.
5.  Calculate the total estimated calories for each dish and for the entire meal.
6.  Calculate the user's BMR using the Mifflin-St Jeor formula and then their TDEE based on their activity level. The activity multipliers are: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very_active=1.9.
    - Mifflin-St Jeor for men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
    - Mifflin-St Jeor for women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
7.  Determine a suitable calorie target for this meal, assuming it's one of three main meals (lunch, ~35% of TDEE).
8.  Assess the meal's suitability based on the user's goal and the meal's calories compared to the target. Provide a status and a helpful message.
9.  Fill out the response strictly according to the provided JSON schema.
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisResponseSchema,
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }
    throw new Error("Failed to analyze meal. The AI model may be overloaded or the image could not be processed.");
  }
};
