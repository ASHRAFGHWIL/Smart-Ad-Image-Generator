import React, { useState, useEffect } from 'react';

import { generateFinalImage } from '../services/geminiService';
import type { UploadedImage, Scene, AdSize, AnalysisResult } from '../types';
import Spinner from './Spinner';

interface FinalImageStepProps {
  uploadedImage: UploadedImage;
  scene: Scene;
  adSize: AdSize;
  adText: { headline: string; body: string };
  analysisResult: AnalysisResult;
  customPrompt: string;
  onRestart: () => void;
}

const getMarketingProfile = (productMaterials: string): { name: string; description: string } => {
    const materials = productMaterials.toLowerCase();
    if (materials.includes('wood') || materials.includes('natural') || materials.includes('organic') || materials.includes('plant')) {
        return { name: 'خشبي/طبيعي', description: 'تطبيق إضاءة دافئة وألوان ترابية لتعزيز الثقة والدفء.' };
    }
    if (materials.includes('metal') || materials.includes('steel') || materials.includes('industrial') || materials.includes('chrome')) {
        return { name: 'معدني/صناعي', description: 'تطبيق إضاءة باردة وانعكاسات حادة لإبراز القوة والدقة.' };
    }
    if (materials.includes('fabric') || materials.includes('textile') || materials.includes('handmade') || materials.includes('woven')) {
        return { name: 'يدوي/منسوجات', description: 'استخدام إضاءة ناعمة وألوان هادئة لإضفاء طابع من الحميمية والجودة.' };
    }
    if (materials.includes('electronic') || materials.includes('plastic') || materials.includes('tech') || materials.includes('device')) {
        return { name: 'تقني/إلكتروني', description: 'استخدام إضاءة متعادلة وخلفية مستقبلية للتأكيد على الابتكار.' };
    }
    if (materials.includes('jewelry') || materials.includes('luxury') || materials.includes('gemstone') || materials.includes('gold') || materials.includes('silver')) {
        return { name: 'فاخر/مجوهرات', description: 'إضافة لمعان ذهبي وتأثيرات فاخرة لإثارة شعور بالأناقة والرغبة.' };
    }
    return { name: 'عام', description: 'تطبيق أفضل الممارسات العامة لتحسين الصورة.' };
};


const FinalImageStep: React.FC<FinalImageStepProps> = ({
  uploadedImage,
  scene,
  adSize,
  adText,
  analysisResult,
  customPrompt,
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
        const imageUrl = await generateFinalImage(uploadedImage, scene, adText, adSize, analysisResult, customPrompt);
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

  const marketingProfile = getMarketingProfile(analysisResult.analysis.materials);

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
                <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
                    <Spinner />
                    <p className="mt-4 text-cyan-400 animate-pulse">جاري تجميع الصورة النهائية... قد يستغرق هذا بعض الوقت.</p>
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 text-center w-full max-w-md">
                      <h4 className="text-lg font-semibold text-teal-300 mb-2 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        محرك التسويق الذكي
                      </h4>
                      <p className="text-sm text-gray-400">
                          تم تحليل منتجك كـ <strong className="text-teal-400">{marketingProfile.name}</strong>.
                          <br />
                          {marketingProfile.description}
                      </p>
                  </div>
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