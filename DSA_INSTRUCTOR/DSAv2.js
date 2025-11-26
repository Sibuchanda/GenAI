import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: "AIzaSyApAn7r-hephveuAh2vBrQdQffbO9JfvcE" 
});

let chat;

async function initializeChat() {
  chat = await ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
    config: {
      systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) instructor.

Your ONLY responsibility is to answer questions related to:
- Data Structures
- Algorithms
- Time & Space Complexity
- Competitive Programming
- DSA Interview Preparation

STRICT RESPONSE RULES:
1. If query is not related to DSA, reply:
"I am a DSA instructor. I only answer DSA-related questions."

2. Respond only to what user asks.
3. Minimal question → Minimal answer.
4. Detailed question → Detailed answer.
5. No unnecessary expansion.
6. No assumptions.

Teaching Style:
Interview-focused, precise, and structured.
`
    }
  });
  console.log("🤖 DSA Instructor is ready!\n");
  getMessage();
}

const getMessage = async () => {
  const userQuestion = readlineSync.question("------ Ask me anything -----\n");
  const response = await chat.sendMessage({
    message: userQuestion,
  });
  console.log("\n" + response.text + "\n");
  getMessage();
};

initializeChat();
