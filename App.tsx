import React, { useState } from 'react';

// FIX: Import UploadedImage from the central types file.
import type { AnalysisResult, Scene, AdSize, UploadedImage } from './types';

// Components for each step
import ImageUploadStep from './components/ImageUploadStep';
import SceneSelectionStep from './components/SceneSelectionStep';
import SizeSelectionStep from './components/SizeSelectionStep';
import AdTextStep from './components/AdTextStep';
import CustomPromptStep from './components/CustomPromptStep';
import FinalImageStep from './components/FinalImageStep';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);

  // Data collected through the steps
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedSize, setSelectedSize] = useState<AdSize | null>(null);
  const [adText, setAdText] = useState<{ headline: string; body: string } | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const handleAnalysisComplete = (result: AnalysisResult, image: UploadedImage) => {
    setAnalysisResult(result);
    setUploadedImage(image);
    setStep(2);
  };

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setStep(3);
  };

  const handleSizeSelect = (size: AdSize) => {
    setSelectedSize(size);
    setStep(4);
  };
  
  const handleAdTextSubmit = (text: { headline: string; body: string }) => {
    setAdText(text);
    setStep(5);
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    setCustomPrompt(prompt);
    setStep(6);
  };

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
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ImageUploadStep onAnalysisComplete={handleAnalysisComplete} />;
      case 2:
        if (!analysisResult || !uploadedImage) return null; // Or show an error/redirect
        return (
          <SceneSelectionStep
            analysisResult={analysisResult}
            uploadedImage={uploadedImage}
            onBack={handleBack}
            onSceneSelect={handleSceneSelect}
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
            />
         );
      case 5:
        return (
            <CustomPromptStep
                onBack={handleBack}
                onCustomPromptSubmit={handleCustomPromptSubmit}
            />
        );
      case 6:
        if (!uploadedImage || !selectedScene || !selectedSize || !adText || !analysisResult) return null;
        return (
            <FinalImageStep
                uploadedImage={uploadedImage}
                scene={selectedScene}
                adSize={selectedSize}
                adText={adText}
                analysisResult={analysisResult}
                customPrompt={customPrompt}
                onRestart={handleRestart}
            />
        );
      default:
        return <ImageUploadStep onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-8">
       <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          مولّد الإعلانات بالذكاء الاصطناعي
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          حوّل صور منتجاتك إلى إعلانات مذهلة في خطوات بسيطة
        </p>
      </header>
      <main className="w-full max-w-5xl bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-10 border border-gray-700 backdrop-blur-sm">
        {renderStep()}
      </main>
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;