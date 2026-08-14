import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

export { GEMINI_MODEL };
export default ai;
