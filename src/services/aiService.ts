
import { GoogleGenAI, Type } from "@google/genai";
import { aiSettingsStorage } from "./aiSettingsStorage";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Clé API manquante.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const aiService = {
  sendMessageStream: async (
    history: ChatMessage[], 
    message: string, 
    onChunk: (text: string) => void,
    fileData?: { data: string, mimeType: string }
  ) => {
    try {
      const ai = getAiClient();
      const settings = aiSettingsStorage.getSettings();
      const config = settings.chatbot;
      
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const result = await ai.models.generateContentStream({
        model: config.model,
        contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
            temperature: config.temperature,
            systemInstruction: config.systemInstruction
        }
      });

      for await (const chunk of result) {
        if (chunk.text) onChunk(chunk.text);
      }
    } catch (error) {
      onChunk("⚠️ Erreur de communication IA.");
    }
  },

  formatBlogContent: async (rawContent: string): Promise<any> => {
    try {
      const ai = getAiClient();
      const settings = aiSettingsStorage.getSettings();
      const config = settings.blog;

      const response = await ai.models.generateContent({
        model: config.model,
        contents: `PROJET : GÉNÉRATION D'UN RAPPORT D'EXPERTISE RICHE.
        
        MISSIONS IMPÉRATIVES POUR CE CONTENU :
        1. EXPLOITATION TOTALE : Ne pas se contenter de formater. Développer chaque point technique pour produire un article long et riche.
        2. STRUCTURE TABLEAUX : Chaque liste de chiffres ou de seuils DOIT être un tableau HTML complexe <table class="w-full...">.
        3. QUOTA ALERTES : Insérer au minimum 3 blocs <div class="bg-blue-50..."> (Conseil) et 3 blocs <div class="bg-amber-50..."> (Vigilance).
        4. DEVISE : Utiliser systématiquement « DA » pour les montants.
        5. STYLE : Aucun astérisque (**). Emphase via <strong> ou « ».
        6. SIGNATURE : Terminer obligatoirement par le bloc noir « Synthèse & Recommandations Compalik ».

        NOTES SOURCE : "${rawContent}"`,
        config: {
          systemInstruction: config.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              html_content: { type: Type.STRING },
              summary: { type: Type.STRING },
              image_prompt: { type: Type.STRING },
              extracted_keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["html_content", "title"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error(error);
      throw new Error("Échec de la génération du rapport enrichi.");
    }
  },

  extractInvoiceData: async (imageBase64: string): Promise<any> => {
    try {
      const ai = getAiClient();
      const settings = aiSettingsStorage.getSettings();
      const base64Data = imageBase64.split(',')[1];
      const response = await ai.models.generateContent({
        model: settings.ocr.model,
        contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: "Extrais les données." }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              client: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
              items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, price: { type: Type.NUMBER } } } }
            }
          }
        }
      });
      return response.text ? JSON.parse(response.text) : null;
    } catch (error) { return null; }
  },

  generateBlogImage: async (promptContext: string): Promise<string> => {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Ultra-luxurious minimalist corporate architectural photography, for: ${promptContext}` }] },
        config: { imageConfig: { aspectRatio: '16:9' } }
      });
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return "";
    } catch { return ""; }
  }
};
