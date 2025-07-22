import { GoogleGenAI, Type } from "@google/genai";
import { Car, AIAdviceResponse, AIDiagnosisResponse, Language } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY is not defined. AI functionality will be disabled.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const prompts = {
    en: {
        advice: (car: Car, serviceType: string) => `You are an expert automotive mechanic and assistant for car owners. The user has the following vehicle: ${car.make} ${car.model}, year ${car.year} with a current mileage of ${car.mileage} km. They are entering the following service: "${serviceType}". Provide a JSON object with 'estimatedCost', 'nextServiceSuggestion', and 'additionalTips' in English. The cost should be in EUR.`,
        diagnosis: (car: Car, problemDescription: string) => `You are a top automotive diagnostician. A user has a ${car.make} ${car.model} (year ${car.year}) and describes the following problem: "${problemDescription}". Perform an analysis and provide a JSON object in English that contains: 1. 'analysis' - an array of objects, each with 'possibleCause', 'estimatedCost' (in EUR), 'complexity' (Low, Medium, High). 2. 'recommendation' - your final recommendation.`
    },
    bg: {
        advice: (car: Car, serviceType: string) => `Ти си експертен автомобилен механик и асистент за собственици на коли в България. Потребителят има следния автомобил: ${car.make} ${car.model}, ${car.year} г. с настоящ пробег ${car.mileage} км. Той въвежда следното обслужване: "${serviceType}". Предостави JSON с 'estimatedCost', 'nextServiceSuggestion' и 'additionalTips' на български. Цената да е в EUR.`,
        diagnosis: (car: Car, problemDescription: string) => `Ти си топ автомобилен диагностик за България. Потребител има ${car.make} ${car.model} (${car.year} г.) и описва следния проблем: "${problemDescription}". Направи анализ и предостави JSON обект на български език, който съдържа: 1. 'analysis' - масив от обекти, всеки с 'possibleCause', 'estimatedCost' (в EUR), 'complexity' (Ниска, Средна, Висока). 2. 'recommendation' - твоята финална препоръка.`
    },
    es: {
        advice: (car: Car, serviceType: string) => `Eres un mecánico experto y asistente para propietarios de automóviles. El usuario tiene el siguiente vehículo: ${car.make} ${car.model}, año ${car.year} con un kilometraje actual de ${car.mileage} km. Está registrando el siguiente servicio: "${serviceType}". Proporciona un objeto JSON con 'estimatedCost', 'nextServiceSuggestion' y 'additionalTips' en español. El costo debe ser en EUR.`,
        diagnosis: (car: Car, problemDescription: string) => `Eres un diagnosticador de automóviles de primer nivel. Un usuario tiene un ${car.make} ${car.model} (año ${car.year}) y describe el siguiente problema: "${problemDescription}". Realiza un análisis y proporciona un objeto JSON en español que contenga: 1. 'analysis' - un array de objetos, cada uno con 'possibleCause', 'estimatedCost' (en EUR), 'complexity' (Baja, Media, Alta). 2. 'recommendation' - tu recomendación final.`
    },
    de: {
        advice: (car: Car, serviceType: string) => `Sie sind ein erfahrener Kfz-Mechaniker und Assistent für Autobesitzer. Der Benutzer hat folgendes Fahrzeug: ${car.make} ${car.model}, Baujahr ${car.year} mit einem aktuellen Kilometerstand von ${car.mileage} km. Er gibt folgenden Service ein: "${serviceType}". Stellen Sie ein JSON-Objekt mit 'estimatedCost', 'nextServiceSuggestion' und 'additionalTips' auf Deutsch bereit. Die Kosten sollen in EUR sein.`,
        diagnosis: (car: Car, problemDescription: string) => `Sie sind ein Top-Kfz-Diagnostiker. Ein Benutzer hat einen ${car.make} ${car.model} (Baujahr ${car.year}) und beschreibt folgendes Problem: "${problemDescription}". Führen Sie eine Analyse durch und stellen Sie ein JSON-Objekt auf Deutsch bereit, das Folgendes enthält: 1. 'analysis' - ein Array von Objekten, jedes mit 'possibleCause', 'estimatedCost' (in EUR), 'complexity' (Niedrig, Mittel, Hoch). 2. 'recommendation' - Ihre endgültige Empfehlung.`
    },
    fr: {
        advice: (car: Car, serviceType: string) => `Vous êtes un mécanicien automobile expert et un assistant pour les propriétaires de voitures. L'utilisateur a le véhicule suivant : ${car.make} ${car.model}, année ${car.year} avec un kilométrage actuel de ${car.mileage} km. Il saisit le service suivant : "${serviceType}". Fournissez un objet JSON avec 'estimatedCost', 'nextServiceSuggestion', et 'additionalTips' en français. Le coût doit être en EUR.`,
        diagnosis: (car: Car, problemDescription: string) => `Vous êtes un excellent diagnostiqueur automobile. Un utilisateur a une ${car.make} ${car.model} (année ${car.year}) et décrit le problème suivant : "${problemDescription}". Effectuez une analyse et fournissez un objet JSON en français contenant : 1. 'analysis' - un tableau d'objets, chacun avec 'possibleCause', 'estimatedCost' (en EUR), 'complexity' (Faible, Moyenne, Élevée). 2. 'recommendation' - votre recommandation finale.`
    }
};

const isSupportedLang = (lang: string): lang is Language => {
    return lang in prompts;
};

export const apiService = {
  isAvailable: () => !!ai,
    
  getAIAdvice: async (car: Car, serviceType: string, lang: Language): Promise<AIAdviceResponse> => {
    if (!ai) throw new Error('AI service is not available.');
    
    const schema = {
        type: Type.OBJECT,
        properties: {
          estimatedCost: { type: Type.STRING, description: `Estimated cost in EUR.` },
          nextServiceSuggestion: { type: Type.STRING, description: 'Recommendation for the next service in kilometers.' },
          additionalTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Additional tips.' },
        },
        required: ["estimatedCost", "nextServiceSuggestion", "additionalTips"]
    };
    
    const currentLang = isSupportedLang(lang) ? lang : 'en';
    const prompt = prompts[currentLang].advice(car, serviceType);
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text.trim());
  },

  getAIDiagnosis: async (car: Car, problemDescription: string, lang: Language): Promise<AIDiagnosisResponse> => {
    if (!ai) throw new Error('AI service is not available.');
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            analysis: {
                type: Type.ARRAY,
                description: "A list of 2-3 possible causes for the problem.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        possibleCause: { type: Type.STRING, description: "The specific possible cause." },
                        estimatedCost: { type: Type.STRING, description: `Estimated cost range for the repair in EUR (e.g., '100 - 200 EUR').` },
                        complexity: { type: Type.STRING, description: "Complexity of the repair (Low, Medium, High)." },
                    },
                    required: ["possibleCause", "estimatedCost", "complexity"]
                }
            },
            recommendation: { type: Type.STRING, description: "Final recommendation for the user (e.g., 'Visit a service station for an accurate diagnosis')." }
        },
        required: ["analysis", "recommendation"]
    };

    const currentLang = isSupportedLang(lang) ? lang : 'en';
    const prompt = prompts[currentLang].diagnosis(car, problemDescription);
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text.trim());
  }
};