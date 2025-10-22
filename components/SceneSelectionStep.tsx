import React, { useState, useEffect } from 'react';

import { generateSceneDescriptions, generateSceneImage } from '../services/geminiService';
import type { AnalysisResult, Scene, UploadedImage } from '../types';
import Spinner from './Spinner';
import SkeletonLoader from './SkeletonLoader';


interface SceneSelectionStepProps {
  analysisResult: AnalysisResult;
  uploadedImage: UploadedImage;
  onBack: () => void;
  onSceneSelect: (scene: Scene) => void;
}

const SceneSelectionStep: React.FC<SceneSelectionStepProps> = ({ analysisResult, onBack, onSceneSelect }) => {
  const [scenes, setScenes] = useState<(Scene | null)[]>(Array(10).fill(null));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateScenes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const descriptions = await generateSceneDescriptions(analysisResult.analysis);
        if (descriptions.length < 10) {
            const diff = 10 - descriptions.length;
            descriptions.push(...Array(diff).fill("مشهد إضافي من اختيارك"));
        }

        const imagePromises = descriptions.map((desc, index) => 
            generateSceneImage(desc)
                .then(imageUrl => ({ description: desc, imageUrl, index }))
                .catch(err => {
                    console.error(`Failed to generate image for description: "${desc}"`, err);
                    return { description: desc, imageUrl: null, index }; 
                })
        );
        
        for (const promise of imagePromises) {
            promise.then(result => {
                if (result.imageUrl) {
                    setScenes(prevScenes => {
                        const newScenes = [...prevScenes];
                        newScenes[result.index] = { description: result.description, imageUrl: result.imageUrl };
                        return newScenes;
                    });
                }
            });
        }

      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateScenes();
  }, [analysisResult]);

  return (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins">
                    الخطوة الثانية: اختيار المشهد
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    اختر أحد المشاهد التي أنشأها الذكاء الاصطناعي كخلفية لمنتجك.
                </p>
            </div>
            <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
                &rarr; العودة
            </button>
        </div>

      {isLoading && scenes.every(s => s === null) && (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <Spinner />
          <p className="mt-4 text-[#007BFF] animate-pulse">جاري إنشاء مشاهد إعلانية مبتكرة...</p>
        </div>
      )}

      {error && (
        <div className="my-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center">
          <p className="font-semibold mb-2">حدث خطأ</p>
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {scenes.map((scene, index) => (
            <div key={index} className="group relative aspect-w-1 aspect-h-1 flex flex-col">
              {scene ? (
                <>
                  <img
                    src={scene.imageUrl}
                    alt={scene.description}
                    className="w-full h-full object-cover rounded-lg shadow-md border-2 border-transparent group-hover:border-[#007BFF] transition-all duration-300"
                  />
                  <button 
                    onClick={() => onSceneSelect(scene)}
                    className="w-full mt-2 text-white font-cairo font-semibold bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-2 px-2 text-xs sm:text-sm">
                    اختيار هذا المشهد
                  </button>
                </>
              ) : (
                <>
                    <SkeletonLoader className="w-full h-full object-cover rounded-lg"/>
                    <div className="w-full h-9 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SceneSelectionStep;