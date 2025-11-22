import { GoogleGenAI } from "@google/genai";
import { GenerateResult } from '../types';

const apiKey = process.env.API_KEY;
// Initialize strictly with the named parameter object as per guidelines
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates a detailed PRD and an App Icon based on a short description.
 */
export const generateAppProject = async (
  appName: string,
  description: string
): Promise<GenerateResult> => {
  
  // 1. Generate the PRD Text
  const textModel = 'gemini-2.5-flash';
  const textPrompt = `
    Atue como um Product Manager Sênior e Arquiteto de Software.
    Crie um documento PRD (Product Requirements Document) altamente detalhado e estruturado para um aplicativo chamado "${appName}".
    
    A ideia do aplicativo é: "${description}".
    
    O formato da resposta deve ser em Markdown, otimizado para ser copiado e colado como um prompt para um Engenheiro de IA criar o código.
    
    A estrutura deve conter:
    1. **Visão Geral do Projeto**: Resumo executivo.
    2. **Fluxo de Usuário (User Flow)**: Passo a passo da jornada.
    3. **Principais Funcionalidades**: Lista detalhada (Must Have).
    4. **Estrutura Técnica Sugerida**: 
       - Frontend (Recomende React + Tailwind)
       - Backend (Se necessário, ou Mock/LocalStorage)
       - Bibliotecas chave.
    5. **Componentes de UI**: Lista de componentes necessários.
    6. **Esquema de Cores e Design**: Sugestão de paleta.
    
    Seja técnico, direto e inspirador.
  `;

  let prdText = "";
  try {
    const textResponse = await ai.models.generateContent({
      model: textModel,
      contents: textPrompt,
      config: {
        temperature: 0.7,
      }
    });
    prdText = textResponse.text || "Erro ao gerar texto.";
  } catch (error) {
    console.error("Erro ao gerar PRD:", error);
    prdText = "Falha ao gerar o documento PRD. Por favor, tente novamente.";
  }

  // 2. Generate the App Icon
  // Using gemini-2.5-flash-image which supports text-to-image generation via generateContent
  // Note: Based on guidelines, we look for inlineData in the parts.
  const imageModel = 'gemini-2.5-flash-image';
  const imagePrompt = `
    Create a high-quality, modern mobile app icon for an app named "${appName}".
    Description of app logic: ${description}.
    Style: Minimalist, vector art, gradient background, rounded corners (iOS style), professional, high resolution (1024x1024).
    Do not include text inside the logo if possible, focus on a symbolic icon.
  `;

  let imageUrl: string | undefined = undefined;

  try {
    const imageResponse = await ai.models.generateContent({
      model: imageModel,
      contents: imagePrompt,
      config: {
        // Specific image generation configs aren't always exposed via generateContent config object in all SDK versions
        // but we pass the prompt clearly. 
        // If using a specific Imagen model, we would use generateImages, but user instruction says use gemini-2.5-flash-image by default.
      }
    });

    // Iterate through parts to find the image as per guidelines
    if (imageResponse.candidates && imageResponse.candidates[0].content.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Standard mimeType usually image/png or image/jpeg
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break; 
        }
      }
    }
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    // We don't fail the whole process if image fails, just return undefined url
  }

  return {
    prd: prdText,
    imageUrl: imageUrl
  };
};