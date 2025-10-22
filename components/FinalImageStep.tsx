import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import type { AnalysisResult, Scene, AdSize, UploadedImage, AdText } from '../types';
import { generateFinalAdImage } from '../services/geminiService';
import Spinner from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { RedoIcon } from './icons/RedoIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ZoomIcon } from './icons/ZoomIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';


interface FinalImageStepProps {
    isGenerating: boolean;
    uploadedImage: UploadedImage;
    scene: Scene;
    adSize: AdSize;
    adText: AdText;
    analysisResult: AnalysisResult;
    customPrompt: string;
    onRestart: () => void;
    onBack: () => void;
    onGenerationStart: () => void;
}

const fontStyles = [
  { key: 'Modern', label: 'حديث' },
  { key: 'Elegant', label: 'أنيق' },
  { key: 'Bold', label: 'عريض' },
  { key: 'Impactful', label: 'بارز' },
  { key: 'Playful', label: 'مرح' },
  { key: 'Cursive', label: 'مخطوطة' },
];

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
    const [isZoomed, setIsZoomed] = useState<boolean>(false);

    useEffect(() => {
        if (isGenerating && !finalImageUrl && !isLoading && !error) {
            const generateImage = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const imageUrl = await generateFinalAdImage(
                        uploadedImage,
                        scene.description,
                        adSize,
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
    }, [isGenerating, uploadedImage, scene, adSize, adText, customPrompt, finalImageUrl, isLoading, error]);

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
                <div 
                    className="relative group max-w-lg mx-auto mb-6 cursor-zoom-in"
                    onClick={() => setIsZoomed(true)}
                >
                    <img src={finalImageUrl} alt="Final Advertisement" className="rounded-lg shadow-2xl w-full" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <ZoomIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                 <div className="flex justify-center items-center gap-4 flex-wrap">
                    <button onClick={handleDownload} className="flex items-center gap-2 text-white font-cairo font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6">
                        <DownloadIcon />
                        تحميل الصورة
                    </button>
                    <button onClick={() => setIsZoomed(true)} className="flex items-center gap-2 text-white font-cairo font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 py-3 px-6">
                        <ZoomIcon />
                        تكبير
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
                {isZoomed && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in"
                    >
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-[60]"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={8}
                            limitToBounds={true}
                            doubleClick={{ disabled: true }}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg backdrop-blur-sm">
                                        <button onClick={() => zoomIn(0.5)} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Zoom In"><ZoomIcon className="w-6 h-6"/></button>
                                        <button onClick={() => zoomOut(0.5)} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Zoom Out"><ZoomOutIcon className="w-6 h-6" /></button>
                                        <button onClick={() => resetTransform()} className="p-2 text-white hover:bg-white/20 rounded-md transition-colors" aria-label="Reset Zoom"><ResetZoomIcon className="w-6 h-6" /></button>
                                    </div>

                                    <TransformComponent wrapperClass="!w-screen !h-screen" contentClass="flex items-center justify-center">
                                        <img
                                            src={finalImageUrl!}
                                            alt="Final Advertisement - Zoomed"
                                            className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl"
                                        />
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                )}
            </div>
        );
    }

    // Step 6: Confirm & Generate
    const selectedStyleLabel = fontStyles.find(s => s.key === adText.fontStyle)?.label || adText.fontStyle;

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
                        <li><strong>نمط الخط:</strong> {selectedStyleLabel}</li>
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