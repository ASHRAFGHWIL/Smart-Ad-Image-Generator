import React, { useState, useEffect } from 'react';

import { generateFinalImage } from '../services/geminiService';
import type { UploadedImage, Scene, AdSize } from '../types';
import Spinner from './Spinner';

interface FinalImageStepProps {
  uploadedImage: UploadedImage;
  scene: Scene;
  adSize: AdSize;
  adText: { headline: string; body: string };
  colorPalette: string[];
  onRestart: () => void;
}

const FinalImageStep: React.FC<FinalImageStepProps> = ({
  uploadedImage,
  scene,
  adSize,
  adText,
  colorPalette,
  onRestart,
}) => {
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const generate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const imageUrl = await generateFinalImage(uploadedImage, scene, adText, adSize, colorPalette);
        setFinalImageUrl(imageUrl);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'فشل إنشاء الصورة النهائية.');
      } finally {
        setIsLoading(false);
      }
    };
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleDownload = () => {
    if (!finalImageUrl) return;
    const link = document.createElement('a');
    link.href = finalImageUrl;
    link.download = `ad-image-${adSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const [width, height] = adSize.split('x').map(Number);
  const aspectRatio = width / height;

  return (
    <div className="animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">
            الخطوة النهائية: إعلانك جاهز!
        </h2>
        <p className="text-gray-400 mb-6">
            شاهد إعلانك النهائي. يمكنك تحميله أو البدء من جديد.
        </p>

        <div className="w-full max-w-xl mx-auto bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Spinner />
                    <p className="mt-4 text-cyan-400 animate-pulse">جاري تجميع الصورة النهائية... قد يستغرق هذا بعض الوقت.</p>
                </div>
            )}
            {error && !isLoading && (
                 <div className="my-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center min-h-[300px] flex flex-col justify-center">
                    <p className="font-semibold mb-2">حدث خطأ</p>
                    <p>{error}</p>
                 </div>
            )}
            {finalImageUrl && !isLoading && (
                <img 
                    src={finalImageUrl} 
                    alt="Final generated advertisement" 
                    className="rounded-md shadow-lg w-full"
                    style={{ aspectRatio: `${aspectRatio}` }}
                />
            )}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
                onClick={onRestart}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
                البدء من جديد
            </button>
            <button
                onClick={handleDownload}
                disabled={!finalImageUrl || isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed"
            >
                تحميل الإعلان
            </button>
        </div>
    </div>
  );
};

export default FinalImageStep;
