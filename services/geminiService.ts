import { GoogleGenAI, Type } from "@google/genai";
import { BmiCategory, HealthTipsResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthTips = async (bmi: number, category: BmiCategory): Promise<HealthTipsResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user has a BMI of ${bmi.toFixed(1)}, which falls into the category: ${category}. 
      Provide a brief, encouraging summary of what this means, and 3 specific, actionable, and scientific health tips to help them maintain or improve their health. 
      Keep the tone professional yet empathetic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A 1-2 sentence summary of the user's BMI status.",
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 actionable health tips.",
            },
          },
          required: ["summary", "tips"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    // Sanitize the response to ensure valid JSON (remove markdown code blocks if present)
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();

    return JSON.parse(jsonString) as HealthTipsResponse;
  } catch (error) {
    console.error("Error fetching health tips:", error);
    return {
      summary: "We couldn't generate personalized tips at this moment.",
      tips: [
        "Consult with a healthcare provider for personalized advice.",
        "Maintain a balanced diet rich in whole foods.",
        "Aim for regular physical activity."
      ]
    };
  }
};