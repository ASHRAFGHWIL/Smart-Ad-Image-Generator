
import React, { useState, useEffect } from 'react';

import type { AnalysisResult, Scene, AdSize, UploadedImage, AdText, AdTemplate } from './types';

// Components for each step
import ImageUploadStep from './components/ImageUploadStep';
import SceneSelectionStep from './components/SceneSelectionStep';
import SizeSelectionStep from './components/SizeSelectionStep';
import AdTextStep from './components/AdTextStep';
import CustomPromptStep from './components/CustomPromptStep';
import FinalImageStep from './components/FinalImageStep';
import ProgressBar from './components/ProgressBar';
import ThemeSwitcher from './components/ThemeSwitcher';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Data collected through the steps
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedSize, setSelectedSize] = useState<AdSize | null>(null);
  const [adText, setAdText] = useState<AdText | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleAnalysisComplete = (result: AnalysisResult, image: UploadedImage) => {
    setAnalysisResult(result);
    setUploadedImage(image);
    setStep(2);
  };

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setSelectedTemplate(null); // Clear template if a custom scene is selected
    setStep(3);
  };

  const handleTemplateSelect = (template: AdTemplate) => {
    setSelectedTemplate(template);
    // FIX: Property 'category' was missing when creating a Scene object from a template.
    const sceneFromTemplate: Scene = {
      description: template.sceneDescription,
      imageUrl: template.previewImageUrl,
      category: template.category,
    };
    setSelectedScene(sceneFromTemplate);
    setStep(3);
  };

  const handleSizeSelect = (size: AdSize) => {
    setSelectedSize(size);
    setStep(4);
  };
  
  const handleAdTextSubmit = (text: AdText) => {
    setAdText(text);
    setStep(5);
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    setCustomPrompt(prompt);
    setStep(6);
  };

  const handleGenerationStart = () => {
    setStep(7);
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setUploadedImage(null);
    setAnalysisResult(null);
    setSelectedScene(null);
    setSelectedSize(null);
    setAdText(null);
    setCustomPrompt('');
    setSelectedTemplate(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ImageUploadStep onAnalysisComplete={handleAnalysisComplete} />;
      case 2:
        if (!analysisResult || !uploadedImage) return null;
        return (
          <SceneSelectionStep
            analysisResult={analysisResult}
            uploadedImage={uploadedImage}
            onBack={handleBack}
            onSceneSelect={handleSceneSelect}
            onTemplateSelect={handleTemplateSelect}
          />
        );
      case 3:
        if (!selectedScene) return null;
        return (
          <SizeSelectionStep
            onBack={handleBack}
            onSizeSelect={handleSizeSelect}
          />
        );
      case 4:
         if (!analysisResult || !selectedScene) return null;
         return (
            <AdTextStep
                productAnalysis={analysisResult.analysis.materials}
                sceneDescription={selectedScene.description}
                onBack={handleBack}
                onAdTextSubmit={handleAdTextSubmit}
                initialFontStyle={selectedTemplate?.fontStyle}
            />
         );
      case 5:
        return (
            <CustomPromptStep
                onBack={handleBack}
                onCustomPromptSubmit={handleCustomPromptSubmit}
                initialPrompt={selectedTemplate?.textPromptInstruction}
            />
        );
      case 6: // Confirm & Generate
      case 7: // View Result
        if (!uploadedImage || !selectedScene || !selectedSize || !adText || !analysisResult) return null;
        return (
            <FinalImageStep
                isGenerating={step === 7}
                uploadedImage={uploadedImage}
                scene={selectedScene}
                adSize={selectedSize}
                adText={adText}
                analysisResult={analysisResult}
                customPrompt={customPrompt}
                onRestart={handleRestart}
                onBack={handleBack}
                onGenerationStart={handleGenerationStart}
            />
        );
      default:
        return <ImageUploadStep onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="bg-[#F8F9FB] dark:bg-gray-900 min-h-screen text-[#1A1A1A] dark:text-gray-100 font-cairo flex flex-col items-center p-4 sm:p-8">
       <header className="w-full max-w-5xl text-center mb-8 relative">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] font-poppins">
          منشئ الصور الإعلانية الذكي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          حوّل صور منتجاتك إلى إعلانات مذهلة في خطوات بسيطة
        </p>
        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
      </header>
      <main className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
        <ProgressBar currentStep={step} totalSteps={7} />
        {renderStep()}
      </main>
      <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
