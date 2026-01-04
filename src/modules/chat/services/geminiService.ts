
import { GoogleGenAI } from "@google/genai";
import { aiConfigService } from "./aiConfigService";

export const geminiService = {
  sendMessageStream: async (history: any[], message: string, onChunk: (text: string) => void) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      onChunk("Désolé, mon module d'intelligence artificielle est actuellement indisponible. Veuillez nous contacter via le formulaire de contact ou par téléphone.");
      return;
    }

    try {
      const config = aiConfigService.getConfig();
      const ai = new GoogleGenAI({ apiKey });
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: config.systemPrompt,
          temperature: 0.7,
        },
        history: history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessageStream({ message });
      for await (const chunk of result) {
        if (chunk.text) onChunk(chunk.text);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      onChunk("Une erreur technique est survenue. Mes excuses. Vous pouvez nous joindre au +213...");
    }
  }
};
