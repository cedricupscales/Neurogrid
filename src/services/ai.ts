import { GoogleGenAI, Type } from "@google/genai";
import { Task, Quadrant, Domain } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const parseBrainDump = async (text: string): Promise<Partial<Task>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following brain-dump text into a list of structured tasks for a productivity app. 
    For each task, provide: title, description, deadline (ISO string or null), domain (Physical, Business, Academic, Social, Personal, Financial), urgency (1-10), importance (1-10), and estimated duration in minutes.
    
    Brain-dump: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            deadline: { type: Type.STRING, nullable: true },
            domain: { type: Type.STRING, enum: Object.values(Domain) },
            urgency: { type: Type.INTEGER },
            importance: { type: Type.INTEGER },
            duration: { type: Type.INTEGER },
          },
          required: ["title", "description", "domain", "urgency", "importance", "duration"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || "[]");
  return parsed.map((t: any) => ({
    ...t,
    id: Math.random().toString(36).substr(2, 9),
    completed: false,
    createdAt: new Date().toISOString(),
    quadrant: calculateQuadrant(t.urgency, t.importance),
  }));
};

const calculateQuadrant = (urgency: number, importance: number): Quadrant => {
  if (urgency >= 5 && importance >= 5) return Quadrant.DO_NOW;
  if (urgency < 5 && importance >= 5) return Quadrant.SCHEDULE;
  if (urgency >= 5 && importance < 5) return Quadrant.DELEGATE;
  return Quadrant.ELIMINATE;
};

export const suggestSchedule = async (tasks: Task[]): Promise<{ taskId: string; start: string; end: string }[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Given these tasks, propose a weekly schedule (timeblocks). 
    Tasks: ${JSON.stringify(tasks.filter(t => !t.completed))}
    Current time: ${new Date().toISOString()}
    
    Return a list of timeblocks with taskId, start (ISO string), and end (ISO string). 
    Prioritize Do Now tasks, then Schedule tasks. Respect durations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            taskId: { type: Type.STRING },
            start: { type: Type.STRING },
            end: { type: Type.STRING },
          },
          required: ["taskId", "start", "end"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const chatWithGemini = async (message: string, history: { role: 'user' | 'bot'; content: string }[]) => {
  const ai = getAI();
  
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a neuro-productivity architect for entrepreneurs. Help them organize their cognitive load, optimize their neural pathways (workflow), and maintain peak mental performance. Use neuro/bio metaphors where appropriate.",
      },
      history: history.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    });
    
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
