import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function ChatWithLLM() {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
  })
}

const getMessage = async () => {
  const userQuestion = readlineSync.question("------ Ask me anything -----\n");
  const response = await chat.sendMessage({
    message: userQuestion,
  });
  console.log(response.text)
  getMessage();
};

getMessage();