import readlineSync from "readline-sync";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os';


const platform = os.platform();

const asyncExecute = promisify(exec);

const ai = new GoogleGenAI({ apiKey: "AIzaSyCtXtAQesyfWqGONoWjPiHyQ6RVSHdhxCY" });

const executeCommand = async({ command }) => {
  try {
    const { stdout, stderr } = await asyncExecute(command);
    if(stderr){
        return `Error : ${stderr}`
    }

    return `Success: ${stdout} || Task executed successfully `
  } catch (err) {
    return `Error occured while executing commands : ${err}`
  }
};


// =========== Information about the actual functions(Tools) ===========
const commandDeclarations = {
  name: "executeCommand",
  description: "It takes one sheel/terminal comand as a input and execute this. It can make directory,make file, edit them, delete them, write contents inside them.",
  parameters: {
    type: "OBJECT", //
    properties: {
      command: {
        type: "STRING",
        description: 'This is the type of command for example, "mkdir calculator", "touch index.html" ',
      },
    },
    required: ["command"],
  },
};

const tools = { executeCommand: executeCommand };

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
        systemInstruction:
          `You are a website builder expert. You can make both frontend and backend side according to user demand. Your currect operating system is : ${platform}. Give commands to the user according to the user operating system support
          -- Your Job would be --
          1. Analyze user query to know what type of website the user want to build.
          2. Give them command step by step
          3. Use availabe tool executeCommand.

          -- Now you can give them command in the following below --
          1. First create a folder.
          2. Inside folder create index.html
          3. Then create style.css
          4. After that script.js
          5. Then write code in html file
          You have to provide the terminal or shell command to user, Then will directly execute it.
          `,
        tools: [
          {
            functionDeclarations: [
              commandDeclarations
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
