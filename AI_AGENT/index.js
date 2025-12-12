import readlineSync from "readline-sync";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ============ Actutal functions(Tools) ==========
const sum = ({ num1, num2 }) => {
  return num1 + num2;
};

const prime = ({ num }) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i == 0) return false;
  }
  return true;
};

const getCryptoPrice = async ({ coin }) => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin`
  );
  const data = await res.json();
  return data;
};

// =========== Information about the actual functions(Tools) ===========
const sumDeclarations = {
  name: "sum",
  description: "Take two numbers and find their sum",
  parameters: {
    type: "OBJECT", // {num1: n1, num2: n2}
    properties: {
      num1: {
        type: "NUMBER",
        description: "This is the first number for example, 10",
      },
      num2: {
        type: "NUMBER",
        description: "This is the second number for example, 20",
      },
    },
    required: ["num1", "num2"],
  },
};

const primeDeclarations = {
  name: "prime",
  description: "Take a number and find whether it is prime or not ",
  parameters: {
    type: "OBJECT", //
    properties: {
      num: {
        type: "NUMBER",
        description: "This is the number for example, 7",
      },
    },
    required: ["num"],
  },
};

const cryptoDeclarations = {
  name: "getCryptoPrice",
  description: "Take coin type and fetch the price of the coin using API",
  parameters: {
    type: "OBJECT", //
    properties: {
      coin: {
        type: "STRING",
        description: 'This is the type of coin for example, "Bitcoin" ',
      },
    },
    required: ["coin"],
  },
};

const tools = { sum: sum, prime: prime, getCryptoPrice: getCryptoPrice };

let history = [];


const runAgent = async (question) => {
  // Pushing user question into the history
  history.push({
    role: "user",
    parts: [{ text: question }],
  });

  while (true) {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
      systemInstruction: "If you get any questions that are not related to the given function declaration then you can answer them as well if you can do. But generate the answer like if Minimal question → Minimal answer.Detailed question → Detailed answer.",
        tools: [
          {
            functionDeclarations: [
              sumDeclarations,
              primeDeclarations,
              cryptoDeclarations,
            ],
          },
        ],
      },
    });

    if (result.functionCalls && result.functionCalls.length > 0) {
      // console.log(result.functionCalls[0]);
      const { name, args } = result.functionCalls[0];

      const funcCall = tools[name];
      const answer = await funcCall(args);

      const functionResponsePart = {
        name: name,
        response: {
          result: answer,
        },
      };

      // Pusing the function call from the model into the history
      history.push({
        role: "model",
        parts: [
          {
            functionCall: result.functionCalls[0],
          },
        ],
      });
      history.push({
        // Pusing the result by the fucntuion call into the history
        role: "user",
        parts: [
          {
            functionResponse: functionResponsePart,
          },
        ],
      });
    } else {
      history.push({
        role: "model",
        parts: [{ text: result.text }],
      });
      console.log(result.text);
      break;
    }
  } //End of while

};

const main = async () => {
  const userQuestion = readlineSync.question("------ Ask me anything -----\n");
  await runAgent(userQuestion);
  main();
};

main();
