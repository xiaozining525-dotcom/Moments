import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InsightData, MoodType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const insightSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    haiku: {
      type: Type.STRING,
      description: "A soothing haiku relevant to the user's mood (in Chinese).",
    },
    quote: {
      type: Type.STRING,
      description: "A famous or philosophical quote (in Chinese).",
    },
    author: {
      type: Type.STRING,
      description: "The author of the quote.",
    },
    tip: {
      type: Type.STRING,
      description: "A small, actionable mindfulness tip (in Chinese).",
    },
  },
  required: ["haiku", "quote", "author", "tip"],
};

export const generateInsight = async (mood: MoodType): Promise<InsightData> => {
  if (!apiKey) {
    // Fallback for demo purposes if no key is present
    console.warn("No API Key found. Returning mock data.");
    // Reduced delay for faster UI transitions
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      haiku: "静坐听雨声\n心随流水去\n自在观浮云",
      quote: "心若冰清，天塌不惊。",
      author: "古语",
      tip: "闭上眼睛，深呼吸三次，感受空气流过鼻尖。"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User is feeling: ${mood}. Generate a soothing insight in Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
        systemInstruction: "You are a Zen master and creative muse. Your goal is to provide comfort, inspiration, and grounding. Keep the tone gentle, poetic, and minimalist.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as InsightData;
  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback on error
    return {
      haiku: "山中有古树\n岁岁叶常青\n此心亦如是",
      quote: "万物静观皆自得。",
      author: "程颢",
      tip: "试着看向窗外，寻找一种绿色的植物，观察它的细节。"
    };
  }
};