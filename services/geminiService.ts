import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnalysisResult, UploadedImage, AdText, AdSize } from "../types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to analyze the uploaded image and extract colors and properties.
export const analyzeImageAndExtractColors = async (
  base64ImageData: string,
  mimeType: string
): Promise<AnalysisResult> => {
  // FIX: Use gemini-2.5-pro for complex reasoning and JSON output.
  const model = "gemini-2.5-pro";
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const prompt = `Analyze the product in this image. Focus on its materials, lighting, and shadows. Also, extract a vibrant and cohesive 5-color palette from the image. The colors should be in hex format. Return a JSON object with this structure: { "colors": ["#...", "#...", ...], "analysis": { "materials": "...", "lighting": "...", "shadows": "..." } }.`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          colors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              materials: { type: Type.STRING },
              lighting: { type: Type.STRING },
              shadows: { type: Type.STRING },
            },
            required: ["materials", "lighting", "shadows"],
          },
        },
        required: ["colors", "analysis"],
      },
    },
  });

  try {
    // FIX: Access the text property directly to get the response.
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Could not parse the analysis from the AI response.");
  }
};

// Function to generate scene descriptions based on image analysis.
export const generateSceneDescriptions = async (
  analysis: AnalysisResult["analysis"]
): Promise<{ description: string; category: string }[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `Based on this product analysis, generate 10 diverse and creative scene descriptions for a product advertisement photo shoot. The scenes should be visually appealing and complement the product's characteristics. For each scene, provide a category from this list: 'Outdoor', 'Studio', 'Minimalist', 'Luxury', 'Abstract', 'Cozy'.
  
  Product Analysis:
  - Materials: ${analysis.materials}
  - Lighting: ${analysis.lighting}
  - Shadows: ${analysis.shadows}
  
  Return a JSON object with a single key "scenes" which is an array of 10 objects. Each object must have "description" and "category" keys. Example: { "scenes": [{ "description": "A sun-drenched beach...", "category": "Outdoor" }, { "description": "A minimalist studio setting...", "category": "Minimalist" }] }`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["description", "category"],
            },
          },
        },
        required: ["scenes"],
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (result.scenes && Array.isArray(result.scenes)) {
        return result.scenes;
    }
    throw new Error("Invalid format for scene descriptions.");
  } catch (e) {
    console.error("Failed to parse JSON response for scenes:", response.text);
    throw new Error("Could not parse scene descriptions from the AI response.");
  }
};

// Function to categorize a single scene description.
export const categorizeSceneDescription = async (description: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `Categorize the following scene description into one of these categories: Outdoor, Studio, Minimalist, Luxury, Abstract, Cozy. Respond with only the category name as a single word. If no category fits well, respond with 'Studio'. Description: "${description}"`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    
    const category = response.text.trim();
    const validCategories = ['Outdoor', 'Studio', 'Minimalist', 'Luxury', 'Abstract', 'Cozy'];
    return validCategories.includes(category) ? category : 'Studio';
};

// Function to generate an image for a scene description.
export const generateSceneImage = async (description: string): Promise<string> => {
    // FIX: Use gemini-2.5-flash-image for general image generation.
    const model = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [{ text: `Generate a high-quality, photorealistic background image for a product advertisement. The scene should be: ${description}. The image should be just the background, with no product in it. It should be suitable to place a product image on top of it.` }],
        },
        config: {
            // FIX: responseModalities must be an array with a single Modality.IMAGE element.
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error('Image generation failed, no image data received.');
};

// Function to generate ad text.
export const generateAdText = async (
  productAnalysis: string,
  sceneDescription: string
): Promise<{ headline: string; body:string; catchphrase: string; }> => {
  const model = "gemini-2.5-flash";
  const prompt = `Create a compelling ad copy for a product with the following analysis, placed in the described scene. Generate:
  1. A short, catchy headline (max 50 characters).
  2. A slightly longer body text (max 150 characters) that highlights the product's best features.
  3. A short, SEO-friendly catchphrase (max 60 characters) to be used as a prominent title.
  
  Product Analysis: ${productAnalysis}
  Scene: ${sceneDescription}
  
  Return a JSON object with this structure: { "headline": "...", "body": "...", "catchphrase": "..." }`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                body: { type: Type.STRING },
                catchphrase: { type: Type.STRING },
            },
            required: ["headline", "body", "catchphrase"],
        },
    },
  });

  try {
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result;
  } catch (e) {
    console.error("Failed to parse JSON response for ad text:", response.text);
    throw new Error("Could not parse ad text from the AI response.");
  }
};

// Function to generate the final ad image by editing/compositing.
export const generateFinalAdImage = async (
    productImage: UploadedImage,
    sceneDescription: string,
    adSize: AdSize,
    adText: AdText,
    customPrompt: string
): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const prompt = `
    Task: Create a final advertisement image with dimensions ${adSize} pixels.
    1. First, generate a background scene described as: "${sceneDescription}".
    2. Then, seamlessly place the provided product image into that scene. It's critical to match the product's original lighting and shadows to make it look completely natural in its new environment.
    3. Finally, add the following advertising text onto the image. Headline: "${adText.headline}". Body: "${adText.body}". The text should be placed in a visually appealing location, using a stylish and readable font with a "${adText.fontStyle}" style. IMPORTANT: All text (headline, body, and catchphrase) MUST be rendered in ALL CAPS and BOLD. Additionally, apply a subtle but professional-looking stroke (outline) to all text. The stroke color should be chosen carefully to contrast beautifully with both the text color and the background, ensuring maximum readability and visual pop.
    ${adText.catchphrase ? `4. Also, prominently feature this SEO catchphrase: "${adText.catchphrase}".` : ''}
    ${customPrompt ? `5. Apply this final user instruction: "${customPrompt}"` : ''}
    
    The final output must be a single, complete advertisement image that combines all these elements, adhering strictly to the ${adSize} dimensions.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: productImage.data, mimeType: productImage.mimeType } },
                { text: prompt },
            ],
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

    throw new Error('Final image generation failed.');
};

export const addTextToImage = async (
    backgroundImage: UploadedImage,
    adText: AdText,
    customPrompt: string
): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const prompt = `
    Task: Add advertising text to the provided image.
    1. Use the provided image as the background. Do not change the background.
    2. Add the following text onto the image:
       - Headline: "${adText.headline}"
       - Body: "${adText.body}"
       ${adText.catchphrase ? `- SEO Catchphrase: "${adText.catchphrase}" (make this prominent)` : ''}
    3. The text should be placed in a visually appealing location.
    4. Use a stylish and readable font with a "${adText.fontStyle}" style. IMPORTANT: All text (headline, body, and catchphrase) MUST be rendered in ALL CAPS and BOLD. Additionally, apply a subtle but professional-looking stroke (outline) to all text. The stroke color should be chosen carefully to contrast beautifully with both the text color and the background, ensuring maximum readability and visual pop.
    ${customPrompt ? `5. Apply this final user instruction for text placement and style: "${customPrompt}"` : ''}
    
    The final output must be a single image with the text added. The image dimensions must remain the same as the original.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: backgroundImage.data, mimeType: backgroundImage.mimeType } },
                { text: prompt },
            ],
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

    throw new Error('Failed to add text to the image.');
};