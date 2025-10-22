import React, { useState, useEffect } from 'react';

import type { AnalysisResult, Scene, AdSize, UploadedImage } from '../types';
import { generateFinalAdImage } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { RedoIcon } from './icons/RedoIcon';
import { ShareIcon } from './icons/ShareIcon';

interface FinalImageStepProps {
    isGenerating: boolean;
    uploadedImage: UploadedImage;
    scene: Scene;
    adSize: AdSize;
    adText: { headline: string; body: string };
    analysisResult: AnalysisResult;
    customPrompt: string;
    onRestart: () => void;
    onBack: () => void;
    onGenerationStart: () => void;
}

const FinalImageStep: React.FC<FinalImageStepProps> = ({
    isGenerating,
    uploadedImage,
    scene,
    adSize,
    adText,
    customPrompt,
    onRestart,
    onBack,
    onGenerationStart
}) => {
    const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isGenerating && !finalImageUrl && !isLoading && !error) {
            const generateImage = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const imageUrl = await generateFinalAdImage(
                        uploadedImage,
                        scene.description,
                        adText,
                        customPrompt
                    );
                    setFinalImageUrl(imageUrl);
                } catch (err) {
                    console.error(err);
                    setError(err instanceof Error ? err.message : 'فشل في إنشاء الصورة النهائية.');
                } finally {
                    setIsLoading(false);
                }
            };
            generateImage();
        }
    }, [isGenerating, uploadedImage, scene, adText, customPrompt, finalImageUrl, isLoading, error]);

    const handleDownload = () => {
        if (!finalImageUrl) return;
        const link = document.createElement('a');
        link.href = finalImageUrl;
        link.download = `advertisement-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share && finalImageUrl) {
            try {
                const response = await fetch(finalImageUrl);
                const blob = await response.blob();
                const file = new File([blob], `advertisement-${Date.now()}.png`, { type: 'image/png' });
                await navigator.share({
                    title: 'إعلان تم إنشاؤه بواسطة الذكاء الاصطناعي',
                    text: adText.headline,
                    files: [file],
                });
            } catch (err) {
                console.error('Error sharing:', err);
                alert('فشلت عملية المشاركة.');
            }
        } else {
            alert('المشاركة غير مدعومة على هذا المتصفح.');
        }
    };

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                <Spinner />
                <p className="mt-4 text-[#007BFF] text-lg animate-pulse">جاري إنشاء تحفتك الفنية...</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">قد تستغرق هذه العملية دقيقة أو دقيقتين.</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="my-4 p-6 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center min-h-[400px] flex flex-col justify-center items-center">
                <p className="font-semibold text-xl mb-3">عفوًا, حدث خطأ</p>
                <p>{error}</p>
                <button 
                    onClick={onBack} 
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg"
                >
                    العودة والمحاولة مرة أخرى
                </button>
            </div>
         );
    }
    
    if (finalImageUrl) {
        // Step 7: View Result
        return (
            <div className="animate-fade-in text-center">
                <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins mb-4">
                    إعلانك جاهز!
                </h2>
                <div className="relative group max-w-lg mx-auto mb-6">
                    <img src={finalImageUrl} alt="Final Advertisement" className="rounded-lg shadow-2xl w-full" />
                </div>
                 <div className="flex justify-center items-center gap-4 flex-wrap">
                    <button onClick={handleDownload} className="flex items-center gap-2 text-white font-cairo font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6">
                        <DownloadIcon />
                        تحميل الصورة
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 text-white font-cairo font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6">
                        <ShareIcon />
                        مشاركة
                    </button>
                    <button onClick={onRestart} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-cairo font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-3 px-6">
                        <RedoIcon />
                        إنشاء إعلان جديد
                    </button>
                </div>
            </div>
        );
    }

    // Step 6: Confirm & Generate
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-gray-100 font-poppins">
                        الخطوة السادسة: المراجعة النهائية والإنشاء
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        تأكد من جميع اختياراتك قبل إنشاء الصورة النهائية.
                    </p>
                </div>
                <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
                    &rarr; العودة
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-700">
                <div>
                    <h3 className="text-xl font-semibold mb-4 border-b dark:border-gray-600 pb-2">ملخص اختياراتك:</h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                        <li><strong>صورة المنتج:</strong> <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} alt="Uploaded Product" className="w-16 h-16 object-cover rounded-md inline-block ml-2"/> تم الرفع</li>
                        <li><strong>المشهد المختار:</strong> {scene.description}</li>
                        <li><strong>حجم الإعلان:</strong> {adSize}</li>
                        <li><strong>العنوان:</strong> {adText.headline}</li>
                        <li><strong>النص الأساسي:</strong> {adText.body}</li>
                        {customPrompt && <li><strong>تعليمات إضافية:</strong> {customPrompt}</li>}
                    </ul>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-lg text-center mb-4">هل أنت جاهز لإنشاء الإعلان؟</p>
                    <button
                        onClick={onGenerationStart}
                        className="w-full text-white font-cairo font-extrabold text-lg bg-gradient-to-r from-[#007BFF] to-[#8A2BE2] hover:from-[#006ae0] hover:to-[#7925c7] rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 py-4 px-8"
                    >
                        ✨ إنشاء الصورة الإعلانية الآن
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinalImageStep;