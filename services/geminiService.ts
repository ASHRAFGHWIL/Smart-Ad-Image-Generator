import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { AnalysisResult, AdSize, Scene, UploadedImage } from '../types';

// Per guidelines, initialize with API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    colors: {
      type: Type.ARRAY,
      description: 'A color palette of 6 hex codes extracted from the product image that are visually appealing together.',
      items: { type: Type.STRING },
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        materials: {
          type: Type.STRING,
          description: 'A brief, 1-2 sentence analysis of the product\'s primary materials and textures.',
        },
        lighting: {
          type: Type.STRING,
          description: 'A brief, 1-2 sentence analysis of the lighting in the image (e.g., soft, hard, warm, cool).',
        },
        shadows: {
          type: Type.STRING,
          description: 'A brief, 1-2 sentence analysis of the shadows in the image (e.g., long, soft, defined).',
        },
      },
      required: ['materials', 'lighting', 'shadows'],
    },
  },
  required: ['colors', 'analysis'],
};


export const analyzeImageAndExtractColors = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  const textPart = {
    text: `Analyze the provided product image. Identify the key visual characteristics and extract a harmonious color palette.
    Follow the JSON schema precisely.
    - Analyze the materials, lighting, and shadows. Keep the analysis concise and descriptive.
    - Extract a color palette of exactly 6 hex codes from the image. The colors should be complementary and suitable for a marketing campaign.
    `,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Pro model for better analysis and JSON following
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    },
  });
  
  const jsonString = response.text.trim();
  try {
    return JSON.parse(jsonString) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonString, e);
    throw new Error("The response from the AI was not valid JSON.");
  }
};


export const generateSceneDescriptions = async (analysis: AnalysisResult['analysis']): Promise<string[]> => {
  const prompt = `
    Based on the following analysis of a product image, generate 10 distinct, creative, and photorealistic scene descriptions to be used as backgrounds for a product advertisement.
    The scenes should be visually compelling and align with the product's characteristics.
    Focus on creating a mood and environment. Do not mention the product itself.
    Each description should be a concise phrase, no more than 15 words.

    Product Analysis:
    - Materials: ${analysis.materials}
    - Lighting: ${analysis.lighting}
    - Shadows: ${analysis.shadows}

    Return the descriptions as a JSON array of 10 strings. For example: ["A serene misty forest at dawn", "A minimalist sun-drenched concrete interior"].
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      temperature: 0.8,
    },
  });
  
  const jsonString = response.text.trim();
  try {
    const descriptions = JSON.parse(jsonString) as string[];
    if (!Array.isArray(descriptions) || descriptions.some(d => typeof d !== 'string')) {
      throw new Error("Invalid format for descriptions.");
    }
    return descriptions;
  } catch (e) {
    console.error("Failed to parse JSON response for scene descriptions:", jsonString, e);
    throw new Error("The response from the AI was not valid JSON for scene descriptions.");
  }
};

export const generateSceneImage = async (description: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Photorealistic ad background: ${description}. High-end, professional photography, 8k, ultra-detailed. No text or logos.`,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1', // The scene selection shows square images
      outputMimeType: 'image/png',
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};


export const generateAdText = async (productAnalysis: string, sceneDescription: string): Promise<{ headline: string; body: string }> => {
    const prompt = `
      Generate a compelling headline and body text for a product advertisement.
      The ad should be short, punchy, and enticing, suitable for a modern audience.
      
      Product analysis: "${productAnalysis}"
      Scene description: "${sceneDescription}"
  
      Return a JSON object with "headline" and "body" keys.
      Headline should be a short, attention-grabbing phrase (max 10 words).
      Body should be a concise descriptive text (max 25 words).
    `;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['headline', 'body'],
        },
        temperature: 0.7,
      },
    });
  
    const jsonString = response.text.trim();
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON response for ad text:", jsonString, e);
      throw new Error("The response from the AI was not valid JSON for ad text.");
    }
  };
  
  export const generateFinalImage = async (
    productImage: UploadedImage,
    scene: Scene,
    adText: { headline: string; body: string },
    adSize: AdSize,
    colorPalette: string[]
  ): Promise<string> => {
    // Fetch the scene image data as base64
    const sceneResponse = await fetch(scene.imageUrl);
    const sceneBlob = await sceneResponse.blob();
    const sceneBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(sceneBlob);
    });
  
  
    const productPart = {
      inlineData: {
        data: productImage.data,
        mimeType: productImage.mimeType,
      },
    };
  
    const scenePart = {
      inlineData: {
        data: sceneBase64,
        mimeType: 'image/png', // generateSceneImage produces PNG
      },
    };
  
    const [width, height] = adSize.split('x').map(Number);
    const isVertical = height > width;
  
    const prompt = `
      Create a final, polished product advertisement image.
      1.  First, accurately remove the background from the provided product image, making it transparent. Preserve all details of the product.
      2.  Use the provided scene image as the new background.
      3.  Seamlessly composite the background-removed product image onto the scene. The product should be the clear focus, realistically lit and scaled.
      4.  Add the following ad text onto the image:
          - Headline: "${adText.headline}"
          - Body: "${adText.body}"
      5.  Use the provided color palette for the text colors. Choose colors that have high contrast against the background.
      6.  The text should be stylishly and professionally placed. The headline should be larger than the body text.
      7.  The final image dimensions must be exactly ${width}x${height} pixels.
      8.  Do not add any other logos, watermarks, or text. The final output must be just the composite image.
      
      Color Palette for text: ${colorPalette.join(', ')}
      Layout hint: For ${isVertical ? 'vertical' : 'horizontal'} layouts, consider placing text at the ${isVertical ? 'top or bottom' : 'side'}.
    `;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [
        { text: prompt },
        productPart,
        scenePart
      ]},
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  
    throw new Error('Failed to generate the final ad image.');
  };
