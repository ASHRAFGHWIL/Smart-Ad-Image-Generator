import React, { useState } from 'react';
import ImageUploadStep from './components/ImageUploadStep';
import SceneSelectionStep from './components/SceneSelectionStep';
import SizeSelectionStep from './components/SizeSelectionStep';
import type { AnalysisResult, Scene } from './types';

export interface UploadedImage {
  data: string; // base64
  mimeType: string;
}

function App() {
  const [step, setStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult, image: UploadedImage) => {
    setAnalysisResult(result);
    setUploadedImage(image);
    setStep(2);
  };
  
  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setAnalysisResult(null);
      setUploadedImage(null);
      setSelectedScene(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          منشئ الصور الإعلانية الذكي
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          مدعوم بقوة Gemini و Nano Banana
        </p>
      </header>

      <main className="w-full max-w-5xl bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 backdrop-blur-sm">
        {step === 1 && <ImageUploadStep onAnalysisComplete={handleAnalysisComplete} />}
        {step === 2 && analysisResult && uploadedImage && (
          <SceneSelectionStep 
            analysisResult={analysisResult} 
            uploadedImage={uploadedImage}
            onBack={handleBack}
            onSceneSelect={handleSceneSelect}
          />
        )}
        {step === 3 && selectedScene && (
          <SizeSelectionStep onBack={handleBack} />
        )}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
        <p>تطبيق تجريبي يوضح قدرات Gemini API.</p>
      </footer>
    </div>
  );
}

export default App;
