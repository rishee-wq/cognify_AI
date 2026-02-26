
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Question, InterviewMode, Feedback, Answer, ATSAnalysis, JobRecommendation } from "../types";

export const geminiService = {
  // Generate high-quality questions with reasoning budget
  generateQuestions: async (profile: UserProfile, mode: InterviewMode, count: number): Promise<Question[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contextStr = `Candidate Resume: ${profile.resumeText || 'Not provided'}. Target Company: ${profile.targetCompany || 'General'}. JD: ${profile.jobDescription || 'Standard ' + profile.targetRole}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate ${count} sophisticated interview questions for a ${profile.skillLevel} ${profile.designation}. 
                 Context: ${contextStr}. 
                 Mode: ${mode}. 
                 Ensure a mix of technical depth and behavioral insight.`,
      config: {
        thinkingConfig: { thinkingBudget: 8192 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "text", "category", "tags", "difficulty"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  },

  chatWithCoach: async (history: { role: 'user' | 'model'; parts: { text: string }[] }[], message: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { 
        thinkingConfig: { thinkingBudget: 4096 },
        systemInstruction: 'You are an expert career coach named CogniFy AI. Provide concise, strategic, and high-impact career advice.' 
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  },

  getInstantHint: async (question: string, profile: UserProfile): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: `Given the question: "${question}", provide a 1-sentence "cheat sheet" hint for a ${profile.designation}.`,
    });
    return response.text || "Focus on your core achievements.";
  },

  recommendJobs: async (profile: UserProfile): Promise<JobRecommendation[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Based on this profile, suggest 4 high-impact career opportunities: 
                 Name: ${profile.name}, Role: ${profile.designation}, Domain: ${profile.domain}.`,
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              location: { type: Type.STRING },
              salaryRange: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["id", "company", "role", "location", "matchScore", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  },

  analyzeResumeATS: async (resumeText: string, jobDescription: string): Promise<ATSAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `ATS Diagnostic: Compare this Resume to the JD.
      Resume: ${resumeText}
      JD: ${jobDescription}`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            keywords: {
              type: Type.OBJECT,
              properties: {
                matched: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                critical: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["matched", "missing", "critical"]
            },
            skillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["skill", "priority", "suggestion"]
              }
            },
            formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedBulletPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["original", "improved", "rationale"]
              }
            },
            overallVerdict: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "keywords", "skillGaps", "formattingIssues", "suggestedBulletPoints", "overallVerdict", "actionPlan"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  },

  evaluateAnswer: async (profile: UserProfile, answer: Answer): Promise<Feedback> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Evaluate Interview Performance.
                 Question: ${answer.questionText}
                 Candidate Answer: ${answer.userAnswer}
                 Role: ${profile.targetRole} (${profile.skillLevel})`,
      config: {
        thinkingConfig: { thinkingBudget: 8192 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvedAnswer: { type: Type.STRING },
            analysis: { type: Type.STRING }
          },
          required: ["score", "strengths", "weaknesses", "improvedAnswer", "analysis"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  }
};
