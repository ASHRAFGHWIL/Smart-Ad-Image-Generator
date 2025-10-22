import { GoogleGenAI, Type, Modality } from "@google/genai";

import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want a more user-friendly way to handle this,
  // but for this environment, throwing an error is appropriate.
  console.error("API_KEY environment variable not set. Please set it in your environment.");
  // A visible error for the user in the app itself is handled in the component.
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    colors: {
      type: Type.ARRAY,
      description: "An array of 5 dominant hex color codes from the image, starting with the most dominant.",
      items: {
        type: Type.STRING,
      },
    },
    analysis: {
      type: Type.OBJECT,
      description: "A brief analysis of the image's visual components.",
      properties: {
        materials: {
          type: Type.STRING,
          description: "Brief description of the product's primary materials or textures visible in the image.",
        },
        lighting: {
          type: Type.STRING,
          description: "Brief description of the lighting style used in the image (e.g., soft studio light, natural light, dramatic).",
        },
        shadows: {
          type: Type.STRING,
          description: "Brief description of the shadows cast by the product (e.g., soft shadows, harsh shadows, minimal shadows).",
        },
      },
      required: ['materials', 'lighting', 'shadows']
    }
  },
  required: ['colors', 'analysis']
};

export async function analyzeImageAndExtractColors(
  imageDataBase64: string,
  mimeType: string
): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error("لم يتم تكوين مفتاح Gemini API. يرجى التأكد من إعداده بشكل صحيح.");
  }
  
  try {
    const imagePart = {
      inlineData: {
        data: imageDataBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Analyze this product image.
      1.  Identify and list the 5 most dominant colors as hex codes.
      2.  Provide a brief, one-sentence analysis for each of the following: the product's materials/textures, the lighting, and the shadows.
      Return the result in a JSON format matching the provided schema. The language for the analysis text should be Arabic.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonString);

    if (!result.colors || !Array.isArray(result.colors) || !result.analysis) {
        throw new Error("Invalid JSON structure received from API.");
    }
    
    return result;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`فشل تحليل الصورة: ${error.message}`);
    }
    throw new Error("حدث خطأ غير معروف أثناء تحليل الصورة.");
  }
}


export async function generateSceneDescriptions(analysis: AnalysisResult['analysis']): Promise<string[]> {
    if (!API_KEY) {
        throw new Error("لم يتم تكوين مفتاح Gemini API.");
    }

    try {
        const prompt = `بناءً على تحليل صورة المنتج التالي:
- الخامات: ${analysis.materials}
- الإضاءة: ${analysis.lighting}
- الظلال: ${analysis.shadows}

قم بتوليد 10 أوصاف مشاهد متنوعة ومبتكرة ومختلفة تماماً عن بعضها البعض تصلح كخلفية إعلانية احترافية للمنتج. يجب أن يكون كل وصف موجزًا ومناسبًا لتوليد صورة منه. أمثلة للأنماط: ديكور منزلي، مكتب، معرض منتجات، إضاءة ليلية، سطح مكتب طبيعي، عرض فاخر.
أرجع النتيجة بصيغة JSON على شكل مصفوفة من 10 سلاسل نصية باللغة العربية.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const jsonString = response.text.trim();
        const descriptions: string[] = JSON.parse(jsonString);

        if (!Array.isArray(descriptions) || descriptions.length === 0) {
            throw new Error("لم يتمكن الذكاء الاصطناعي من توليد أوصاف مشاهد.");
        }
        
        return descriptions;

    } catch (error) {
        console.error("Error generating scene descriptions:", error);
        throw new Error("فشل في توليد أوصاف المشاهد.");
    }
}

export async function generateSceneImage(description: string): Promise<string> {
    if (!API_KEY) {
        throw new Error("لم يتم تكوين مفتاح Gemini API.");
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Generate a photorealistic, high-quality, professional advertising background image based on this description: "${description}"` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error generating scene image:", error);
        throw new Error(`فشل في توليد صورة المشهد: "${description}"`);
    }
}