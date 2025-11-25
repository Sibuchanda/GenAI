import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
dotenv.config();

const history = [];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function ChatWithLLM(userQuestion) {
  //storing user question into the history array
  history.push({
    role: "user",
    parts: [{ text: userQuestion }],
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
  });
   // Storing model context into the history array
    history.push({
    role: "model",
    parts: [{ text: response.text }],
  });
  console.log(response.text);
}

const getMessage = async () => {
  const userQuestion = readlineSync.question("------ Ask me anything -----\n");
  await ChatWithLLM(userQuestion);
  getMessage();
};

getMessage();