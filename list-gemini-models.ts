import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    if (!apiKey) {
        console.error("No API key found!");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // We can't easily list models via the SDK without a direct fetch or using a specific version
    // Let's try to fetch from the API directly to see what's available
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("AVAILABLE MODELS (v1beta):", JSON.stringify(data, null, 2));

        const responseV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const dataV1 = await responseV1.json();
        console.log("AVAILABLE MODELS (v1):", JSON.stringify(dataV1, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
